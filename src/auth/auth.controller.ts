import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('signIn')
  async signIn(@Request() req, @Res({ passthrough: true }) response: Response) {
    const token = await this.authService.getCookiesFromToken(req.user);
    response.cookie('jwt', token, { httpOnly: true, secure: false });
    return await this.authService.signIn(req.user);
  }

  @Post('signUp')
  async signUp(@Body() dto: CreateUserDto) {
    return await this.authService.sigUp(dto);
  }
  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return await this.authService.refreshToken(req.user);
  }
}
