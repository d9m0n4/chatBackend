import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Dialog } from '../dialog/entities/dialog.entity';
import { User } from '../user/entities/user.entity';
import { Attachment } from '../attachment/entities/attachment.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Dialog)
    private dialogRepository: Repository<Dialog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(createMessageDto: CreateMessageDto, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const dialog = await this.dialogRepository.findOne({
      where: { id: createMessageDto.dialogId },
    });

    const message = new Message();
    message.user = user;
    message.dialog = dialog;
    message.content = createMessageDto.content;

    // for (const attachmentItem of createMessageDto.attachments) {
    //   const attachment = new Attachment()
    //   attachment.message = message
    //   attachment.url = attachmentItem
    // }

    const newMessage = await this.messageRepository.save(message);
    dialog.latestMessage = newMessage.id;
    await this.dialogRepository.save(dialog);

    console.log(newMessage);

    return newMessage;
  }

  async getAllMessagesByDialogId(dialogId: number) {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.dialog', 'dialog')
      .leftJoinAndSelect('message.user', 'user')
      .where('dialog.id = :dialogId', { dialogId })
      .orderBy('message.created_at', 'DESC')
      .take(50)
      .select([
        'message',
        'user.id',
        'user.nickName',
        'user.name',
        'user.avatarUrl',
      ])
      .getMany();

    return messages.reverse();
  }
}
