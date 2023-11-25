import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private filesService: FilesService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findOne(@Query('id') id: number) {
    return this.userService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  findByNickName(@Query('nickname') nickName: string, @Req() req) {
    return this.userService.findByNickName({ nickName, user: req.user });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return this.userService.getMe(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const sharpedFile = await this.filesService.filterFiles(avatar);
    console.log(sharpedFile);
    const savedFiles = await this.filesService.save(sharpedFile);
    updateUserDto.avatarUrl = savedFiles ? savedFiles[0].url : null;
    return this.userService.update(req.user.id, updateUserDto);
  }
}
