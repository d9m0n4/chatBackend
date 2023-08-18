import { INestApplicationContext, UnauthorizedException } from '@nestjs/common';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import { IoAdapter } from '@nestjs/platform-socket.io';

export class CookieAuthSocketAdapter extends IoAdapter {
  constructor(app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);

    server.use((socket, next) => {
      const headers = socket.handshake.headers;
      const cookies = cookie.parse(headers.cookie || '');

      if (cookies.jwt) {
        try {
          const decodedToken = jwt.verify(cookies.jwt, 'qwe123');
          socket.user = decodedToken;
        } catch (error) {
          if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedException('error'));
          } else {
            console.error('JWT verification failed:', error);
          }
        }
      }
      next();
    });

    return server;
  }
}
