import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Dialog } from '../dialog/entities/dialog.entity';
import { User } from '../user/entities/user.entity';
import { FilesService } from 'src/files/files.service';
import { File } from '../files/entities/file.entity';
import { FavoritesMessage } from './entities/favoritesMessages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Dialog, User, File, FavoritesMessage]),
  ],
  controllers: [MessageController],
  providers: [MessageService, FilesService],
  exports: [MessageService],
})
export class MessageModule {}
