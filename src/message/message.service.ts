import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Dialog } from '../dialog/entities/dialog.entity';
import { User } from '../user/entities/user.entity';
import { ReturnUserDto } from '../user/dto/return-user.dto';
import { File } from '../files/entities/file.entity';
import { isArray } from 'class-validator';
import { FavoritesMessage } from './entities/favoritesMessages.entity';
import { MessageConstants } from './message.constants';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Dialog)
    private dialogRepository: Repository<Dialog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(FavoritesMessage)
    private favoriteMessageRepository: Repository<FavoritesMessage>,
  ) {}
  async create(createMessageDto: CreateMessageDto, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['avatar'],
    });
    const dialog = await this.dialogRepository.findOne({
      where: { id: createMessageDto.dialogId },
      relations: { users: true },
    });

    const message = new Message();
    message.user = user;
    message.dialog = dialog;
    message.content = createMessageDto.content;

    const newMessage = await this.messageRepository.save(message);

    const attachments = isArray(createMessageDto.files)
      ? await Promise.all(
          createMessageDto.files.map(async (attachmentItem) => {
            const attachment = new File();
            attachment.message = newMessage;
            attachment.url = attachmentItem.url;
            attachment.user = user;
            attachment.ext = attachmentItem.ext;
            attachment.name = attachmentItem.name;
            attachment.fileType = attachmentItem.fileType;
            attachment.dialog = dialog;
            attachment.size = attachmentItem.size;
            attachment.originalName = attachmentItem.originalname;
            return this.fileRepository.save(attachment);
          }),
        )
      : null;

    dialog.latestMessage = newMessage.id;
    await this.dialogRepository.save(dialog);

    return {
      ...newMessage,
      user: {
        ...new ReturnUserDto(newMessage.user),
        avatar: user.avatar ? user.avatar.url : null,
      },
      dialog: {
        ...dialog,
        users: dialog.users.map((user) => new ReturnUserDto(user)),
      },
      files: attachments,
    };
  }

  async deleteMessage(
    messageId: number,
    userId: number,
    deleteForEveryone = false,
  ) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['user', 'dialog'],
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    const dialog = await this.dialogRepository.findOne({
      where: { id: message.dialog.id },
      relations: ['users'],
    });

    const mId = message.id;

    if (message.deletedForUsers && message.deletedForUsers.includes(userId)) {
      return null;
    }

    if (deleteForEveryone) {
      await this.messageRepository.softRemove(message);
      const previousLatestMessage = await this.messageRepository.findOne({
        where: { dialog: { id: dialog.id } },
        order: { created_at: 'desc' },
        relations: ['user'],
      });
      dialog.latestMessage = previousLatestMessage
        ? previousLatestMessage.id
        : null;
      await this.dialogRepository.save(dialog);
      return {
        success: true,
        message: 'Сообщение удалено успешно',
        messageId: mId,
        dialog: dialog.id,
        messageItem: {
          ...previousLatestMessage,
          dialog,
        },
      };
    } else {
      message.deletedForUsers = [...(message.deletedForUsers || []), userId];
      await this.messageRepository.save(message);
    }
    return {
      success: true,
      message: 'Сообщение удалено успешно',
      messageId: mId,
      dialog: dialog.id,
      messageItem: null,
    };
  }

  async updateMessagesStatus(dialogId: number, userId: number) {
    try {
      const result = await this.messageRepository
        .createQueryBuilder('message')
        .update(Message)
        .set({ isRead: true })
        .where('dialogId = :dialogId', { dialogId })
        .andWhere('userId != :userId', { userId })
        .execute();

      const dialog = await this.dialogRepository.findOne({
        where: { id: dialogId },
        relations: ['users', 'users.avatar'],
      });
      return {
        ...dialog,
        users: dialog.users.map((user) => new ReturnUserDto(user)),
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  async getAllMessagesByDialogId(
    dialogId: number,
    userId: number,
    skip?: number,
  ) {
    try {
      const messagesCount = await this.messageRepository.count({
        where: { dialog: { id: dialogId } },
      });
      const totalPages = Math.ceil(
        messagesCount / MessageConstants.MESSAGES_TAKE_COUNT,
      );
      const skipCount = skip || 0;

      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .where('message.userId = :userId', { userId })
        .leftJoinAndSelect('message.dialog', 'dialog')
        .leftJoinAndSelect('dialog.users', 'users')
        .leftJoinAndSelect('message.user', 'user')
        .leftJoinAndSelect('user.avatar', 'userAvatar')
        .leftJoinAndSelect('message.files', 'files')
        .where('dialog.id = :dialogId', { dialogId })
        .andWhere('NOT :userId = ANY(message.deletedForUsers)', {
          userId: userId,
        })
        .orderBy('message.created_at', 'DESC')
        .skip(skipCount)
        .take(MessageConstants.MESSAGES_TAKE_COUNT)
        .select([
          'message',
          'user.id',
          'user.nickName',
          'user.name',
          'userAvatar.url',
          'dialog',
          'users.id',
          'users.avatar',
          'users.name',
          'users.nickName',
          'files',
        ])
        .getMany();

      return {
        messages: this.groupMessagesByDate(messages),
        totalPages,
      };
    } catch (e) {
      throw new BadRequestException(e.message || e);
    }
  }

  async addFavoriteMessage(userId: number, messageId: number) {
    try {
      const favoriteMessage = await this.favoriteMessageRepository.findOne({
        where: { message: { id: messageId } },
      });

      if (favoriteMessage) {
        throw new BadRequestException('Сообщение уже добавлено в избранное');
      }
      const user = await this.userRepository.findOneBy({ id: userId });
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
      });
      if (!user || !message) {
        throw new BadRequestException(
          'Ошибка добавления сообщения в избранное',
        );
      }

      const savedMessage = await this.favoriteMessageRepository.save({
        user,
        message,
      });

      return {
        user: new ReturnUserDto(savedMessage.user),
        message: savedMessage.message,
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  async getFavoriteMessages(userId: number) {
    try {
      const favoriteMessages = await this.favoriteMessageRepository
        .createQueryBuilder('favoriteMessage')
        .leftJoinAndSelect('favoriteMessage.message', 'message')
        .leftJoinAndSelect('message.user', 'messageUser')
        .leftJoinAndSelect('messageUser.avatar', 'avatar')
        .leftJoinAndSelect('message.files', 'files')
        .leftJoin('favoriteMessage.user', 'user')
        .where('user.id = :userId', { userId })
        // .andWhere('favoriteMessage.message != NULL')
        .getMany();

      const messages = favoriteMessages
        .filter((message) => message.message !== null)
        .map((m) => {
          return { ...m.message, created_at: m.created_at };
        });

      return this.groupMessagesByDate(messages);
    } catch (e) {
      return new BadRequestException(e);
    }
  }

  groupMessagesByDate(messagesData: Array<Message | FavoritesMessage>) {
    const groupedMessages = {};

    const messages = messagesData.map((message) => {
      return {
        ...message,
        user: new ReturnUserDto({
          ...message.user,
          avatar: message.user.avatar,
        }),
      };
    });

    messages.reverse().forEach((message) => {
      const date = message.created_at.toISOString().substr(0, 10);
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });

    return groupedMessages;
  }
}
