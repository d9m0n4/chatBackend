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
import { Inject, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GatewaySession } from './app.gateway.session';
import { AuthenticatedSocket } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { Message } from '../message/entities/message.entity';
import { Dialog } from '../dialog/entities/dialog.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(@Inject('GATEWAY_SESSION') readonly sessions: GatewaySession) {}
  @WebSocketServer()
  server: Server;

  @UseGuards(JwtAuthGuard)
  handleConnection(client, ...args) {
    if (client.user) {
      this.sessions.setUserSocket(client.user.sub, client);
      console.log('from_connected', client.id, client.user.sub);
    }
  }

  handleDisconnect(client: any) {
    if (client.user) {
      this.sessions.removeUserSocket(client.user.sub);
      console.log(client.user, 'disconnected');
      client.emit('dis', 'отвалился');
    }
  }

  async afterInit(server: any) {
    console.log('afterInit socket');
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
          console.log(clientSocket.user);
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
      // const currentUser = dialog.users.find(user => user.id === userId)
      // const socket = this.sessions.getUserSocket(currentUser.id)
      // if (socket) {
      //   socket.emit('update_messages_status', {
      //     userId,
      //     dialogId: dialog.id,
      //   });
      // }
      dialog.users.forEach((user) => {
        const socket = this.sessions.getUserSocket(user.id);
        if (socket) {
          socket.emit('update_messages_status', {
            userId,
            dialogId: dialog.id,
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
}
