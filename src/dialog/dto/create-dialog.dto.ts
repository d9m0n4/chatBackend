import { IsNotEmpty } from 'class-validator';

export class CreateDialogDto {
  @IsNotEmpty({ message: 'Поле не может быть пустым!' })
  creator: number;
}
