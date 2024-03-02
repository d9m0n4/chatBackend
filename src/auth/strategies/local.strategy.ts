import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'nickName', passReqToCallback: true });
  }
  async validate(
    request: Request,
    nickName: string,
    password: string,
  ): Promise<any> {
    try {
      if (!nickName || !password) {
        throw new BadRequestException('Логин и пароль должны быть указаны');
      }

      const user = await this.authService.validateUser(nickName, password);

      if (!user) {
        throw new BadRequestException('Не верный логин или пароль');
      }

      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
