import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilesService } from 'src/files/files.service';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private eventEmitter: EventEmitter2,
    private filesService: FilesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('file', 3))
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 10,
            message: 'kek',
          }),
        ],
        fileIsRequired: false,
      }),
    )
    files?: Array<Express.Multer.File>,
  ) {
    const newFiles = await this.filesService.filterFiles(files);
    if (newFiles) {
      createMessageDto.files = await this.filesService.save(newFiles);
    }

    const message = await this.messageService.create(
      createMessageDto,
      req.user.id,
    );

    this.eventEmitter.emit('message_create', message);
    return message;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllMessagesByDialogId(@Query('dialogId') dialogId: number) {
    return this.messageService.getAllMessagesByDialogId(dialogId);
  }
}
