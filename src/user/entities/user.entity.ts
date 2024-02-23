import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../message/entities/message.entity';
import { Dialog } from '../../dialog/entities/dialog.entity';
import { UserAvatar } from './userAvatar.entity';
import { FavoritesMessage } from '../../message/entities/favoritesMessages.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name?: string;

  @Column({ unique: true })
  nickName?: string;

  @OneToOne(() => UserAvatar, (avatar) => avatar.id, { cascade: true })
  @JoinColumn({ name: 'avatar' })
  avatar?: UserAvatar;

  @Column()
  password?: string;

  @Column({ default: false })
  isOnline?: boolean;

  @ManyToMany(() => Dialog, (dialog) => dialog.users)
  dialogs: Dialog[];

  @OneToMany(() => Message, (message) => message.user)
  message: Message[];

  @OneToMany(
    () => FavoritesMessage,
    (favoritesMessage) => favoritesMessage.user,
  )
  savedMessages: FavoritesMessage[];

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
