import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { JoinTable } from 'typeorm';
import { Message } from '../../message/entities/message.entity';
import { ReturnUserDto } from '../../user/dto/return-user.dto';

@Entity()
export class Dialog {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToMany(() => User, (user) => user.dialogs)
  @JoinTable()
  users: User[];

  @OneToMany(() => Message, (message) => message.dialog)
  messages: Message[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
