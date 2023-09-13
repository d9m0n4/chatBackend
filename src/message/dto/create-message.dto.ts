import { Attachment } from '../../attachment/entities/attachment.entity';
import { IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  dialogId: number;

  @IsNotEmpty()
  content: string;

  files?: any;

  attachments?: Attachment[];
}
