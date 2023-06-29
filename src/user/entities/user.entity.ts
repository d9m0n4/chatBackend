import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsNotEmpty, Min} from "class-validator";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    name?: string

    @Column({unique: true})
    nickName?: string

    @Column()
    password?: string
}
