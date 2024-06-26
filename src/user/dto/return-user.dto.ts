import { User } from '../entities/user.entity';

export class ReturnUserDto {
  id: number;
  name: string;
  nickName: string;
  avatar: string;
  isOnline: boolean;
  constructor(dto: User) {
    this.name = dto.name;
    this.nickName = dto.nickName;
    this.id = dto.id;
    this.avatar = dto.avatar ? dto.avatar.url : null;
    this.isOnline = dto.isOnline;
  }
}
