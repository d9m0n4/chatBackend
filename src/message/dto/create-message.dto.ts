import { IsNotEmpty } from 'class-validator';
import { FileM } from '../../files/types/FileM';

export class CreateMessageDto {
  @IsNotEmpty()
  dialogId: number;

  @IsNotEmpty()
  content: string;

  files?: FileM[];
}
