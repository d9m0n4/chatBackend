import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DialogService } from './dialog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('dialogs')
export class DialogController {
  constructor(
    private readonly dialogService: DialogService,
    private eventEmitter: EventEmitter2,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('search')
  findByNickName(@Query('nickname') nickName: string, @Req() req) {
    return this.dialogService.searchDialog(nickName, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: { partner: number }, @Req() req) {
    const { partner } = body;
    const dialog = await this.dialogService.create(partner, req.user.id);
    this.eventEmitter.emit('dialog_create', dialog);
    return dialog;
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyDialogs(@Req() req) {
    return await this.dialogService.getMyDialogsWithUsers(req.user.id);
  }
}
