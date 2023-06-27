import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {UserService} from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(@Inject(forwardRef(() => UserService)) private readonly userService: UserService) {}

 async validateUser(nickName: string) {
     return await this.userService.findOne(nickName)
 }
}
