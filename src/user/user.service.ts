import {BadRequestException, Injectable} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {FindOneOptions, Repository} from "typeorm";

interface loginUser {
  userName: string,
  password: string
}

@Injectable()
export class UserService {
  constructor(@InjectRepository(User)
  private userRepository: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findOne({
      where: {nickName: createUserDto.nickName}
    })
    if (existUser) {
      throw new BadRequestException('Пользователь с таким ником уже зарегестрирован')
    }
    return this.userRepository.save(createUserDto)
  }

  async findOne(nickName: string) {
    return this.userRepository.findOne({where: {nickName}});
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
