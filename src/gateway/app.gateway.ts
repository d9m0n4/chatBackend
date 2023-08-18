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
  handleConnection(client, ...args): any {
    if (client.user) {
      this.sessions.setUserSocket(client.user.sub, client);
    }
  }

  handleDisconnect(client: any): any {
    if (client.user) {
      this.sessions.removeUserSocket(client.user.sub);
    }
  }

  afterInit(server: any): any {
    console.log('afterInit socket');
  }

  @SubscribeMessage('create_dialog')
  handleCreateDialog(
    @MessageBody() data: any,
    @ConnectedSocket() socket,
  ): string {
    const users = this.sessions.getSockets();
    socket.emit('users', { users: users.entries() });
    console.log(data);
    return 'asdasdasd';
  }
}
