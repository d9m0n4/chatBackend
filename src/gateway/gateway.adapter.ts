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
      const token = socket.handshake.headers.authorization.split(' ')[1];
      if (token) {
        try {
          socket.user = await this.jwtService.verifyAsync(
            token.trim().substring(1, token.length - 1),
          );
          next();
        } catch (error) {
          if (error instanceof jwt.TokenExpiredError) {
            socket.disconnect();
            next();
          } else {
            console.error('JWT verification failed:', error);
            throw new Error();
          }
        }
      }
      next();
    });

    return server;
  }
}
