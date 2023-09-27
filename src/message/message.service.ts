import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Dialog } from '../dialog/entities/dialog.entity';
import { User } from '../user/entities/user.entity';
import { ReturnUserDto } from '../user/dto/return-user.dto';
import { File } from '../files/entities/file.entity';

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
  ) {}
  async create(createMessageDto: CreateMessageDto, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
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

    const attachments = await Promise.all(
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
    );

    dialog.latestMessage = newMessage.id;
    await this.dialogRepository.save(dialog);

    return {
      ...newMessage,
      user: new ReturnUserDto(newMessage.user),
      dialog: {
        ...dialog,
        users: dialog.users.map((user) => new ReturnUserDto(user)),
      },
      files: attachments,
    };
  }

  async getAllMessagesByDialogId(dialogId: number) {
    try {
      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.dialog', 'dialog')
        .leftJoinAndSelect('dialog.users', 'users')
        .leftJoinAndSelect('message.user', 'user')
        .leftJoinAndSelect('user.avatarUrl', 'userAvatar')
        .leftJoinAndSelect('message.files', 'files')
        .where('dialog.id = :dialogId', { dialogId })
        .orderBy('message.created_at', 'DESC')
        .take(50)
        .offset(0)
        .select([
          'message',
          'user.id',
          'user.nickName',
          'user.name',
          'userAvatar.url AS userAvatar',
          'dialog',
          'users.id',
          // 'users.avatarUrl',
          'users.name',
          'users.nickName',
          'files',
        ])
        .getMany();

      const groupedMessages = {};

      messages.reverse().forEach((message) => {
        const date = message.created_at.toISOString().substr(0, 10);
        if (!groupedMessages[date]) {
          groupedMessages[date] = [];
        }
        groupedMessages[date].push(message);
      });

      return groupedMessages;
    } catch (e) {
      console.log(e);
    }
  }
}
