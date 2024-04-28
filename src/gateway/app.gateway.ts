import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Server as SocketIOServer } from 'socket.io';
import { Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { GatewaySession } from './app.gateway.session';
import { AuthenticatedSocket } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { Message } from '../message/entities/message.entity';
import { Dialog } from '../dialog/entities/dialog.entity';
import { JwtService } from '@nestjs/jwt';
import { WSAuthMiddleware } from './middleware/ws.middleware';
import { DialogService } from '../dialog/dialog.service';
import { UserService } from '../user/user.service';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Methods',
      'Access-Control-Request-Headers',
      'Access-Control-Allow-Origin',
    ],
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly dialogService: DialogService,
    private readonly userService: UserService,
    @Inject('GATEWAY_SESSION') readonly sessions: GatewaySession,
  ) {}
  @WebSocketServer()
  server: Server;

  afterInit(server: SocketIOServer) {
    const middle = WSAuthMiddleware(this.jwtService);
    server.use(middle);
    console.log('afterInit socket', middle.name);
  }

  async handleConnection(client: AuthenticatedSocket, ...args) {
    if (client.user) {
      console.log(client.user);
      this.sessions.setUserSocket(client.user.sub, client);
      await this.userService.updateOnlineStatus(client.user.sub, true);
      console.log('from_connected', client.id, client.user.sub);

      const friendsIds = await this.dialogService.getMyFriendsIds(
        client.user.sub,
      );
      const myFriendsOnline = [];
      friendsIds.forEach((id) => {
        const friendSocket = this.sessions.getUserSocket(id);
        if (friendSocket) {
          myFriendsOnline.push(id);
          friendSocket.emit('set_friend_online', client.user.sub);
        }
      });
      this.server.emit('friends_online', myFriendsOnline);
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.sessions.removeUserSocket(client.user.sub);
      await this.userService.updateOnlineStatus(client.user.sub, false);
      const friendsIds = await this.dialogService.getMyFriendsIds(
        client.user.sub,
      );
      friendsIds.forEach((id) => {
        const friendSocket = this.sessions.getUserSocket(id);
        if (friendSocket) {
          friendSocket.emit('set_friend_offline', client.user.sub);
        }
      });
      console.log(client.user, 'disconnected');
    }
  }

  @SubscribeMessage('on_dialog_leave')
  async handleLeaveDialog(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() args: { dialogId: number },
  ) {
    const roomName = `dialog_${args.dialogId}`;
    socket.leave(roomName);
  }

  @SubscribeMessage('on_dialog_join')
  async handleJoinDialog(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() args: { dialogId: number },
  ) {
    const roomName = `dialog_${args.dialogId}`;

    socket.join(roomName);
  }

  @SubscribeMessage('on_typing_message')
  async handleTypingMessage(
    @MessageBody() myDialogPartner: { partner: number; dialog: number },
    @ConnectedSocket() clientSocket: AuthenticatedSocket,
  ) {
    if (myDialogPartner) {
      const myDialogPartnerSocket = await this.sessions.getUserSocket(
        myDialogPartner.partner,
      );
      if (myDialogPartnerSocket) {
        myDialogPartnerSocket.emit('on_typing_message', myDialogPartner.dialog);
      }
    }
  }
  @SubscribeMessage('on_stop_typing_message')
  async handleStopTypingMessage(
    @MessageBody() myDialogPartner: { partner: number; dialog: number },
    @ConnectedSocket() clientSocket: AuthenticatedSocket,
  ) {
    if (myDialogPartner) {
      const myDialogPartnerSocket = await this.sessions.getUserSocket(
        myDialogPartner.partner,
      );
      if (myDialogPartnerSocket) {
        myDialogPartnerSocket.emit(
          'on_stop_typing_message',
          myDialogPartner.dialog,
        );
      }
    }
  }

  @OnEvent('on_create_dialog')
  async handleCreateDialog({ dialog, me, partner }) {
    if (partner) {
      const myDialogPartnerSocket = await this.sessions.getUserSocket(partner);
      if (myDialogPartnerSocket) {
        myDialogPartnerSocket.emit('new_dialog_created', {
          ...dialog,
          partner: me,
        });
      }
    }
  }

  @OnEvent('message_create')
  handleCreateMessage(payload: Message) {
    if (payload) {
      payload.dialog.users.forEach((user) => {
        const socket = this.sessions.getUserSocket(user.id);
        if (socket) {
          socket.emit('message_created', payload);
        }
      });
    }
  }

  @OnEvent('update_messages')
  handleUpdateMessagesStatus({
    dialog,
    userId,
  }: {
    dialog: Dialog;
    userId: number;
  }) {
    if (dialog) {
      dialog.users.forEach((user) => {
        const socket = this.sessions.getUserSocket(user.id);
        if (socket) {
          socket.emit('update_messages_status', {
            userId,
            dialog,
          });
        }
      });
    }
  }

  @OnEvent('delete_message')
  handleDeleteMessage(payload: { messageId: number; dialog: number }) {
    if (payload) {
      const roomName = `dialog_${payload.dialog}`;
      this.server
        .to(roomName)
        .emit('message_deleted', { messageId: payload.messageId });
    }
  }
  @OnEvent('updateDialogLastMessage')
  handleUpdateLastMessage(payload: Message) {
    if (payload) {
      payload.dialog.users.forEach((user) => {
        if (user) {
          const socket = this.sessions.getUserSocket(user.id);
          if (socket) {
            socket.emit('update_last_message', payload);
          }
        }
      });
    }
  }
}
