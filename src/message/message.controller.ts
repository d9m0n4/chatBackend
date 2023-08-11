import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  createFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    // return this.messageService.create(createMessageDto);
    return file;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    return this.messageService.create(createMessageDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllMessagesByDialogId(@Query('dialogId') dialogId: number) {
    return this.messageService.getAllMessagesByDialogId(dialogId);
  }
}
