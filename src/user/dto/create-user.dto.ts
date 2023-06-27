import {IsNotEmpty, Min} from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({message: 'Поле не может быть пустым!'})
    nickName: string

    @IsNotEmpty({message: 'Поле не может быть пустым!'})
    name: string

    @IsNotEmpty({message: 'Пароль не может быть пустым!'})
    @Min(8, {message: 'Пароль должен быть не менее 8 символов!'})
    password: string
}
