import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { Dialog } from '../dialog/entities/dialog.entity';
import { UserAvatar } from './entities/userAvatar.entity';
import { File } from '../files/entities/file.entity';
import { FilesService } from '../files/files.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Dialog, UserAvatar, File]),
    AuthModule,
  ],
  controllers: [UserController],
  providers: [UserService, FilesService],
  exports: [UserService],
})
export class UserModule {}
