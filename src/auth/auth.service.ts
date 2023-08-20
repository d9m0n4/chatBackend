import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { ReturnUserDto } from '../user/dto/return-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(nickName: string, password: string) {
    const user = await this.userService.findOne(nickName);
    if (user && (await bcrypt.compare(password, user.password))) {
      return new ReturnUserDto(user);
    }
    return null;
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

    return new ReturnUserDto(newUser);
  }

  async signIn(user: User) {
    const payload = {
      nickName: user.nickName,
      sub: user.id,
    };
    return {
      ...user,
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async refreshToken(user) {
    const payload = {
      nickName: user.nickName,
      sub: user.id,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
