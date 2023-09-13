import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Dialog } from '../dialog/entities/dialog.entity';
import { User } from '../user/entities/user.entity';
import { FilesService } from 'src/files/files.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Dialog, User])],
  controllers: [MessageController],
  providers: [MessageService, FilesService],
  exports: [MessageService],
})
export class MessageModule {}
