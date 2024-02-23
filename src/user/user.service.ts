import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { ReturnUserDto } from './dto/return-user.dto';
import { UserAvatar } from './entities/userAvatar.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAvatar)
    private userAvatarRepository: Repository<UserAvatar>,
  ) {}

  async create(userDto: CreateUserDto) {
    return this.userRepository.save(userDto);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(nickName: string) {
    try {
      return await this.userRepository.findOne({ where: { nickName } });
    } catch (e) {
      console.log(e);
    }
  }

  async findById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      return user;
    } catch (e) {
      console.log(e);
    }
  }

  async findByNickName({ nickName, user }: { nickName: string; user: User }) {
    try {
      const users = await this.userRepository.findBy({
        nickName: Like(`%${nickName}%`),
      });

      if (!users) {
        return new NotFoundException();
      }
      return users.filter((userFromDB) => {
        if (userFromDB.nickName === user.nickName) {
          return;
        }
        return new ReturnUserDto(user);
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getMe(user) {
    try {
      const userData = await this.userRepository.findOne({
        where: { id: user.id },
        relations: { avatar: true },
      });
      return new ReturnUserDto({ ...userData, avatar: userData.avatar });
    } catch (e) {
      console.log(e);
      return new UnauthorizedException();
    }
  }

  async update(userId, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return new NotFoundException('Пользователь не найден');
      }

      const isNickNameTaken = await this.userRepository.findOne({
        where: { nickName: updateUserDto.nickName },
        select: ['id'],
      });

      if (isNickNameTaken && isNickNameTaken.id !== userId) {
        return new BadRequestException('Никнейм уже занят');
      }

      if (user.avatar) {
        await this.userAvatarRepository.remove(user.avatar);
      }
      user.nickName = updateUserDto.nickName;
      user.name = updateUserDto.name;

      if (updateUserDto.avatarUrl) {
        const file = new UserAvatar();
        file.url = updateUserDto.avatarUrl;
        user.avatar = await this.userAvatarRepository.save(file);
      }

      await this.userRepository.update(
        { nickName: user.nickName },
        { avatar: user.avatar, name: user.name, nickName: user.nickName },
      );

      return new ReturnUserDto(
        await this.userRepository.findOne({
          where: { nickName: user.nickName },
          relations: ['avatar'],
        }),
      );
    } catch (e) {
      return new BadRequestException(e);
    }
  }

  async updateOnlineStatus(userId: number, status: boolean) {
    try {
      return await this.userRepository.update(
        { id: userId },
        { isOnline: status },
      );
    } catch (e) {
      return new BadRequestException(e);
    }
  }
}
