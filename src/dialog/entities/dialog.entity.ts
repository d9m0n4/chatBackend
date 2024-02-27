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
import { File } from '../../files/entities/file.entity';

@Entity()
export class Dialog {
  @PrimaryGeneratedColumn()
  id?: number;

  @ManyToMany(() => User, (user) => user.dialogs, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinTable()
  users: User[];

  @OneToMany(() => Message, (message) => message.dialog, {
    cascade: true,
  })
  messages: Message[];

  @OneToMany(() => File, (file) => file.dialog)
  files: File[];

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
