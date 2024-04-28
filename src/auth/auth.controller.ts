import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { CookieOptions, Response } from 'express';
import { ReturnUserDto } from '../user/dto/return-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('signIn')
  async signIn(@Request() req, @Res({ passthrough: true }) response: Response) {
    try {
      if (!req.user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const { accessToken, refreshToken, ...user } =
        await this.authService.signIn(req.user);

      const cookieOptions: CookieOptions = {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'none',
      };

      response.cookie('jwt', accessToken, cookieOptions);
      response.cookie('refresh', refreshToken, cookieOptions);

      return { ...new ReturnUserDto(user), accessToken, message: 'success' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error signing in');
    }
  }

  @Post('signUp')
  async signUp(@Body() dto: CreateUserDto) {
    return await this.authService.sigUp(dto);
  }

  @Post('signOut')
  signOut(@Res() response: Response) {
    response.clearCookie('jwt');
    response.clearCookie('refresh');
    response.status(HttpStatus.OK).send('ok');
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Get('refresh')
  async refreshToken(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.refreshToken(req.user);
    response.cookie('jwt', token.accessToken, {
      httpOnly: false,
      secure: false,
    });
    return token;
  }
}
