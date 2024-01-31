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

      const dialogData = await this.dialogRepository.save(dialog);
      const partnerData = dialogData.users.find((user) => user.id !== userId);

      return {
        ...dialogData,
        users: undefined,
        partner: new ReturnUserDto(partnerData),
        unreadMessagesCount: 0,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async searchDialog(userName: string, userId: number) {
    try {
      const userForDialog = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.dialogs', 'dialogs')
        .leftJoinAndSelect('dialogs.users', 'dialogUsers')
        .where('user.id != :userId', { userId })
        .andWhere('user.nickName like :name', { name: `%${userName}%` })
        .getMany();

      return userForDialog.filter((user) => {
        const f = user.dialogs.find((dialog) =>
          dialog.users.some((u) => u.id === userId),
        );
        if (!f) {
          return user;
        }
      });
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  async getMyDialogsWithUsers(userId: number) {
    try {
      const dialogs = await this.dialogRepository
        .createQueryBuilder('dialog')
        .leftJoinAndSelect('dialog.users', 'users')
        .leftJoin('dialog.users', 'user')
        .leftJoinAndSelect('users.avatar', 'avatar')
        .leftJoin('dialog.messages', 'messages')
        .leftJoin('messages.user', 'messagesUsers')
        .leftJoinAndMapOne(
          'dialog.latestMessage',
          Message,
          'message',
          'message.id = dialog.latestMessage',
        )
        .leftJoin('message.user', 'lastMessageUser')
        .addSelect([
          'lastMessageUser.id',
          'users',
          'avatar.url',
          'messages',
          'messagesUsers.id',
        ])
        .where('user.id = :userId', { userId })
        .orderBy('dialog.updated_at', 'DESC')
        .getMany();

      return dialogs.map((dialog) => {
        const partner = dialog.users.find((user) => user.id !== userId);

        const partnerMessages = dialog.messages.filter(
          (message) => message.user.id !== userId,
        );
        const unreadMessagesCount = partnerMessages.reduce(
          (count, message) => (message.isRead === false ? count + 1 : count),
          0,
        );
        return {
          ...dialog,
          partner: new ReturnUserDto(partner),
          unreadMessagesCount,
          users: undefined,
          messages: undefined,
        };
      });
    } catch (error) {
      console.log(error);
      throw new NotFoundException();
    }
  }

  async getMyFriendsIds(userId: number) {
    try {
      const dialogs = await this.dialogRepository
        .createQueryBuilder('dialog')
        .innerJoinAndSelect('dialog.users', 'users')
        .innerJoin('dialog.users', 'user')
        .where('user.id = :userId', { userId })
        .getMany();

      const friends = dialogs.map((dialog) => {
        return dialog.users.filter((user) => user.id !== userId)[0].id;
      });
      return friends;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
