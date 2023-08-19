import { INestApplicationContext, UnauthorizedException } from '@nestjs/common';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';

export class CookieAuthSocketAdapter extends IoAdapter {
  private jwtService: JwtService;
  constructor(app: INestApplicationContext) {
    super(app);
    this.jwtService = app.get(JwtService);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);

    server.use(async (socket, next) => {
      const headers = socket.handshake.headers;
      const cookies = cookie.parse(headers.cookie || '');

      if (cookies.jwt) {
        try {
          const decodedToken = await this.jwtService.verifyAsync(cookies.jwt);

          socket.user = decodedToken;
        } catch (error) {
          if (error instanceof jwt.TokenExpiredError) {
            // const refreshToken = cookies.refresh;
            // const decodedToken = await this.jwtService.verifyAsync(
            //   refreshToken,
            // );
            // const payload = {
            //   nickName: decodedToken.nickName,
            //   sub: decodedToken.sub,
            // };
            // const newJwt = await this.jwtService.signAsync(payload);
            socket.emit('refreshToken');
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
