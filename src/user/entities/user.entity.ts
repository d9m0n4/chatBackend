import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @Column({ unique: true })
  nickName?: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column()
  password?: string;
}
