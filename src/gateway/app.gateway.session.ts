import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket } from './types';

@Injectable()
export class GatewaySession {
  private readonly session: Map<number, AuthenticatedSocket> = new Map();

  setUserSocket(userId: number, socket: AuthenticatedSocket) {
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
