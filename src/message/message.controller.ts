import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  getAllMessagesByDialogId(@Query('dialogId') dialogId: number) {
    return this.messageService.getAllMessagesByDialogId(dialogId);
  }
}
