import { Socket } from 'socket.io';

interface TokenUser {
  nickName: string;
  sub: number;
  iat: number;
  exp: number;
}
export interface AuthenticatedSocket extends Socket {
  user?: TokenUser;
}
