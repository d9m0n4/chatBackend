import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: any, ...args): any {
    console.log('connected', client.id);
  }

  handleDisconnect(client: any): any {
    console.log('disconnected');
  }

  afterInit(server: any): any {
    console.log('afterInit socket');
  }

  @SubscribeMessage('create_dialog')
  handleCreateDialog(client: any, payload: any): string {
    return 'asdasdasd';
  }
}
