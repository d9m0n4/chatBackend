import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
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
import { User } from '../user/entities/user.entity';

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
  @Post('delete/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: number,
    @Req() req,
    @Body('deleteForEveryone') deleteForEveryone: false,
  ) {
    const {
      messageItem,
      message,
      dialog,
      success,
      messageId: mId,
    } = await this.messageService.deleteMessage(
      messageId,
      req.user.id,
      deleteForEveryone,
    );
    if (messageItem) {
      this.eventEmitter.emit('updateDialogLastMessage', messageItem);
    }
    this.eventEmitter.emit('delete_message', { messageId: mId, dialog });
    return {
      success,
      message,
      messageId: mId,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllMessagesByDialogId(@Query('dialogId') dialogId: number, @Req() req) {
    return this.messageService.getAllMessagesByDialogId(dialogId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getMessagesHistory(
    @Query('dialogId') dialogId: number,
    @Query('skip') skip: number,
    @Req() req,
  ) {
    return this.messageService.getAllMessagesByDialogId(
      dialogId,
      req.user.id,
      skip,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update')
  async updateMessagesStatus(@Body() body, @Req() req) {
    const updatedMessages = await this.messageService.updateMessagesStatus(
      body.dialogId,
      req.user.id,
    );
    this.eventEmitter.emit('update_messages', {
      dialog: updatedMessages,
      userId: req.user.id,
    });
    return updatedMessages;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/favorites')
  async addFavoriteMessage(@Body() body, @Req() req) {
    const data = await this.messageService.addFavoriteMessage(
      req.user.id,
      body.message,
    );
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/favorites')
  async getFavoriteMessages(@Req() req) {
    const messages = await this.messageService.getFavoriteMessages(req.user.id);
    return messages;
  }
}
