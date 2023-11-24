import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';
import { FileM } from '../../files/types/FileM';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  nickName: string;

  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  name: string;

  avatarUrl: FileM;
}
