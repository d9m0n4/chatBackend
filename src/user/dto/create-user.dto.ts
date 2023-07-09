import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  nickName: string;

  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  name: string;

  @IsNotEmpty({ message: 'Пароль не может быть пустым!' })
  password: string;
}
