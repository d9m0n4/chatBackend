import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'nickName' });
  }

  async validate(nickName: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(nickName, password);
    if (!user) {
      throw new UnauthorizedException('Не верный логин или пароль');
    }
    return user;
  }
}
