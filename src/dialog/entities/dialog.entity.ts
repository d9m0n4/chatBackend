import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from '../../message/entities/message.entity';

@Entity()
export class Dialog {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToMany(() => User, (user) => user.dialogs)
  @JoinTable()
  users: User[];

  @OneToMany(() => Message, (message) => message.dialog)
  messages: Message[];

  @Column({ nullable: true })
  latestMessage: number | null;

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
