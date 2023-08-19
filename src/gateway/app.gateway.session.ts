import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class GatewaySession {
  private readonly session: Map<number, Socket> = new Map();

  setUserSocket(userId: number, socket: Socket) {
    this.session.set(userId, socket);
  }
  getUserSocket(id: number) {
    return this.session.get(id);
  }

  removeUserSocket(id: number) {
    this.session.delete(id);
  }

  getSockets() {
    return this.session;
  }
}
