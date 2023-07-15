import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dialog } from './entities/dialog.entity';
import { In, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Message } from '../message/entities/message.entity';
import { ReturnUserDto } from '../user/dto/return-user.dto';

@Injectable()
export class DialogService {
  constructor(
    @InjectRepository(Dialog)
    private readonly dialogRepository: Repository<Dialog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(partner: number, userId: number) {
    try {
      const users = await this.userRepository.findBy({
        id: In([partner, userId]),
      });

      if (users.length < 2) {
        return new BadRequestException();
      }

      const existDialog = await this.dialogRepository
        .createQueryBuilder('dialog')
        .innerJoin('dialog.users', 'user')
        .where('user.id IN (:...userIds)', { userIds: [partner, userId] })
        .groupBy('dialog.id')
        .having('COUNT(dialog.id) = :userCount', { userCount: users.length })
        .getMany();

      if (existDialog.length > 0) {
        return new BadRequestException('Такой диалог уже существует');
      }

      const dialog = new Dialog();
      dialog.users = users;

      return this.dialogRepository.save(dialog);
    } catch (error) {
      console.log(error);
      throw new NotFoundException();
    }
  }

  async getMyDialogsWithUsers(userId: number) {
    try {
      const dialogs = await this.dialogRepository
        .createQueryBuilder('dialog')
        .leftJoinAndSelect('dialog.users', 'user')
        .leftJoinAndMapOne(
          'dialog.latestMessage',
          Message,
          'message',
          'message.dialogId = dialog.id',
        )
        .leftJoinAndSelect('dialog.users', 'dialog_users')
        .where('user.id = :userId', { userId })
        .getMany();

      return dialogs.map((dialog) => ({
        ...dialog,
        users: dialog.users.map((user) => new ReturnUserDto(user)),
      }));
    } catch (error) {
      console.log(error);
      throw new NotFoundException();
    }
  }
}
