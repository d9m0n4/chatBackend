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
  handleUserOnline(
    @MessageBody() myDialogPartners: any,
    @ConnectedSocket() clientSocket,
  ) {
    if (myDialogPartners) {
      myDialogPartners.forEach((userId) => {
        const myDialogPartnerSocket = this.sessions.getUserSocket(userId);
        if (myDialogPartnerSocket) {
          myDialogPartnerSocket.emit('online', clientSocket.user.sub);
        }
      });
    }
    const onlineDialogs = myDialogPartners.map((userId) => {
      const onlineSocket = this.sessions.getUserSocket(userId);
      if (onlineSocket) {
        return onlineSocket.user.id; // authSocket
      }
      return;
    });
    console.log(onlineDialogs);
  }
}
