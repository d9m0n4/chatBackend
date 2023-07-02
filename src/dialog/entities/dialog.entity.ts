import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Dialog {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  creator?: number;
}
