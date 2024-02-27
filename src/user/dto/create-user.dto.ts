import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  nickName: string;

  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  name: string;

  @IsNotEmpty({ message: 'Пароль не может быть пустым!' })
  @MinLength(8, { message: 'Пароль не соотвествует инимальной длине' })
  password: string;
}
