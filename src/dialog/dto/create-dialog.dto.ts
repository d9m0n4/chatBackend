import { IsNotEmpty } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class CreateDialogDto {
  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  partner: number;
}
