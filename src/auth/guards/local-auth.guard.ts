import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { body } = request;

    if (!body || !body.nickName || !body.password) {
      throw new BadRequestException('Логин и пароль должны быть указаны');
    }

    return super.canActivate(context);
  }
}
