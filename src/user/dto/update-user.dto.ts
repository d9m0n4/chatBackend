import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  nickName: string;

  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  name: string;

  avatarUrl: string;
}
