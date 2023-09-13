import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Dialog } from '../../dialog/entities/dialog.entity';
import { JoinColumn } from 'typeorm';
import { Attachment } from '../../attachment/entities/attachment.entity';
import { Exclude, Transform } from 'class-transformer';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  content: string;

  @OneToMany(() => Attachment, (attach) => attach.message)
  attachments: Attachment[];

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Dialog, { nullable: false })
  @JoinColumn({ name: 'dialogId' })
  dialog: Dialog;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @Column('varchar', { nullable: true, array: true })
  files: string[];

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
