import {
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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      console.log(user);
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
      });
      return new ReturnUserDto(userData);
    } catch (e) {
      console.log(e);
      return new UnauthorizedException();
    }
  }
}
