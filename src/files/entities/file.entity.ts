import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from '../../message/entities/message.entity';
import { Dialog } from '../../dialog/entities/dialog.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  url: string;

  @Column()
  ext: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  originalName: string;

  @Column({ nullable: true })
  size: number;

  @Column({ nullable: true })
  fileType: string;

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

  @ManyToOne(() => User, (user) => user.avatarUrl)
  user: User;

  @ManyToOne(() => Message)
  @JoinColumn()
  message: Message;

  @ManyToOne(() => Dialog)
  @JoinColumn()
  dialog: Dialog;
}
