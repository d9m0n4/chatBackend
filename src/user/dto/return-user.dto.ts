import { User } from '../entities/user.entity';
import { File } from '../../files/entities/file.entity';

export class ReturnUserDto {
  id: number;
  name: string;
  nickName: string;
  avatarUrl: File;
  constructor(dto: User) {
    this.name = dto.name;
    this.nickName = dto.nickName;
    this.id = dto.id;
    this.avatarUrl = dto.avatarUrl;
  }
}
