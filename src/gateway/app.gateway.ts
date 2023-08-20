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
    }
  }

  handleDisconnect(client: any) {
    if (client.user) {
      this.sessions.removeUserSocket(client.user.sub);
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
    if (myDialogPartners) {
      myDialogPartners.forEach((userId) => {
        const myDialogPartnerSocket = this.sessions.getUserSocket(userId);
        if (myDialogPartnerSocket && clientSocket.user) {
          return myDialogPartnerSocket.emit('online', clientSocket.user.sub);
        }
      });
    }
  }

  @SubscribeMessage('on_typing_message')
  async handleTypingMessage(
    @MessageBody() myDialogPartner: { partner: number; dialog: number },
    @ConnectedSocket() clientSocket: AuthenticatedSocket,
  ) {
    console.log(myDialogPartner);
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
}
