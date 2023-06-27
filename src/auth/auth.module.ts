import {forwardRef, Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {UserService} from "../user/user.service";
import {UserModule} from "../user/user.module";
import {LocalStrategy} from "./strategies/local.strategy";
import {PassportModule} from "@nestjs/passport";

@Module({
  imports: [forwardRef(() => UserModule), PassportModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, LocalStrategy],
  exports: [AuthService]
})
export class AuthModule {}
