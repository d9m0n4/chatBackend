import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { GatewaySession } from './app.gateway.session';
import { DialogService } from '../dialog/dialog.service';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Dialog } from '../dialog/entities/dialog.entity';
import { UserAvatar } from '../user/entities/userAvatar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Dialog, UserAvatar])],
  providers: [
    UserService,
    DialogService,
    AppGateway,
    {
      provide: 'GATEWAY_SESSION',
      useClass: GatewaySession,
    },
  ],
})
export class GatewayModule {}
