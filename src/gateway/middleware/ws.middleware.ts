import { AuthenticatedSocket } from '../types';
import { JwtService } from '@nestjs/jwt';

export type SocketMiddleware = (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void,
) => void;
export const WSAuthMiddleware = (jwtService: JwtService): SocketMiddleware => {
  return async (socket, next) => {
    try {
      const token = socket.handshake.headers['authorization'].split(' ')[1];
      const payload = jwtService.verify(token, { secret: 'qwe123' });
      if (payload) {
        socket.user = payload;
        next();
      } else {
        next({
          name: 'Unauthorizaed',
          message: 'Unauthorizaed',
        });
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.log(error);
        socket.emit('unauth');
      } else {
        next({
          name: 'Unauthorized',
          message: 'Unauthorized',
        });
      }
    }
  };
};
