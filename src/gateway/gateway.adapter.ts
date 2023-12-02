import { INestApplicationContext } from '@nestjs/common';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedSocket } from './types';

export class CookieAuthSocketAdapter extends IoAdapter {
  private jwtService: JwtService;
  constructor(app: INestApplicationContext) {
    super(app);
    this.jwtService = app.get(JwtService);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);

    server.use(async (socket: AuthenticatedSocket, next) => {
      const headers = socket.handshake.headers;
      const cookies = cookie.parse(headers.cookie || '');

      if (cookies.jwt) {
        try {
          socket.user = await this.jwtService.verifyAsync(cookies.jwt);
          next();
        } catch (error) {
          if (error instanceof jwt.TokenExpiredError) {
            socket.emit('refreshToken');
            socket.disconnect();
            next();
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
