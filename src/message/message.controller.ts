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
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  createFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    // return this.messageService.create(createMessageDto);
    return file;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    const message = await this.messageService.create(
      createMessageDto,
      req.user.id,
    );
    this.eventEmitter.emit('message_create', message);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllMessagesByDialogId(@Query('dialogId') dialogId: number) {
    return this.messageService.getAllMessagesByDialogId(dialogId);
  }
}
