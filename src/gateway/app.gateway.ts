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
import { Server } from 'socket.io';
import {
  Inject,
  UnauthorizedException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GatewaySession } from './app.gateway.session';
import { AuthenticatedSocket } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { Message } from '../message/entities/message.entity';
import { Dialog } from '../dialog/entities/dialog.entity';
import { JwtService } from '@nestjs/jwt';
import { WSAuthMiddleware } from './middleware/ws.middleware';
import { Server as SocketIOServer, Socket } from 'socket.io';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    @Inject('GATEWAY_SESSION') readonly sessions: GatewaySession,
  ) {}
  @WebSocketServer()
  server: Server;

  afterInit(server: SocketIOServer) {
    const middle = WSAuthMiddleware(this.jwtService);
    server.use(middle);
    console.log('afterInit socket', middle);
  }

  handleConnection(client: AuthenticatedSocket, ...args) {
    console.log(client.user);
    if (client.user) {
      console.log(client.user);
      this.sessions.setUserSocket(client.user.sub, client);
      console.log('from_connected', client.id, client.user.sub);
    }
  }
  handleDisconnect(client: any) {
    console.log('disconnect eptas');

    if (client.user) {
      this.sessions.removeUserSocket(client.user.sub);
      console.log(client.user, 'disconnected');
      client.emit('dis', 'отвалился');
    }
  }

  @SubscribeMessage('create_dialog')
  async handleCreateDialog(
    @MessageBody() data: any,
    @ConnectedSocket() socket,
  ) {
    const users = this.sessions.getSockets();
    // socket.emit('users', socket.user);
    return 'asdasdasd';
  }

  @SubscribeMessage('on_dialog_leave')
  async handleLeaveDialog(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() args: { dialogId: number },
  ) {
    const roomName = `dialog_${args.dialogId}`;
    socket.leave(roomName);
    console.log(socket.user.sub, 'leave', args.dialogId);
  }

  @SubscribeMessage('on_dialog_join')
  async handleJoinDialog(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() args: { dialogId: number },
  ) {
    const roomName = `dialog_${args.dialogId}`;
    socket.join(roomName);
    console.log(socket.user.sub, 'joined', args.dialogId);
  }

  @SubscribeMessage('user_online')
  async handleUserOnline(
    @MessageBody() myDialogPartners: number[],
    @ConnectedSocket() clientSocket: AuthenticatedSocket,
  ) {
    const partnersOnline = [];
    if (myDialogPartners) {
      myDialogPartners.forEach((userId) => {
        const myDialogPartnerSocket = this.sessions.getUserSocket(userId);
        if (myDialogPartnerSocket && clientSocket.user) {
          console.log('hueta', clientSocket.user);
          myDialogPartnerSocket.emit('online', clientSocket.user.sub);
          partnersOnline.push(myDialogPartnerSocket.user.sub);
        }
      });
      clientSocket.emit('friends_online', partnersOnline);
    }
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

  @OnEvent('message_create')
  handleCreateMessage(payload: Message) {
    if (payload) {
      payload.dialog.users.forEach((user) => {
        const socket = this.sessions.getUserSocket(user.id);
        if (socket) {
          socket.emit('message_created', payload);
        }
      });
      // const roomName = `dialog_${payload.dialog.id}`;
      // this.server.to(roomName)
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

  @OnEvent('dialog_create')
  handleDialogCreate(payload) {
    if (payload) {
      payload.users.forEach((user) => {
        const socket = this.sessions.getUserSocket(user.id);
        if (socket) {
          socket.emit('dialog_created', { ...payload, users: undefined });
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

//TODO:при удалении сообщения у собеседника не обновляетя список сообщений
