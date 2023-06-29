import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(nickName: string) {
    return await this.userService.findOne(nickName);
  }

  async sigUp(user: CreateUserDto) {
    const existUser = await this.userService.findOne(user.nickName);
    if (existUser)
      throw new BadRequestException(
        'Пользователь с таким ником уже зарегестрирован',
      );
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.userService.create({
      ...user,
      password: hashedPassword,
    });
    const { nickName, id, name } = newUser;
    const access_token = await this.jwtService.signAsync(newUser);
    return { nickName, id, name, access_token };
  }

  async signIn(user: User) {
    const userFromDb = await this.userService.findOne(user.nickName);
    if (!userFromDb) throw new ForbiddenException('Access Denied');
    const isPasswordMatch = await bcrypt.compare(
      user.password,
      userFromDb.password,
    );
    if (!isPasswordMatch) throw new ForbiddenException('Access Denied');

    const payload = { sub: userFromDb.id, username: userFromDb.nickName };
    const { nickName, id, name } = userFromDb;
    return {
      nickName,
      id,
      name,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // async createTokens () {
  //    const accessToken = await this.jwtService.signAsync()
  // }
}
