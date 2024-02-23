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
    try {
      const { partner } = body;
      const dialog = await this.dialogService.create(partner, req.user.id);
      const me = dialog.users.find((user) => user.id === req.user.id);
      this.eventEmitter.emit('on_create_dialog', { dialog, me, partner });
      console.log(dialog.users);
      return { ...dialog, users: undefined };
    } catch (e) {
      return e.message;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyDialogs(@Req() req) {
    return await this.dialogService.getMyDialogsWithUsers(req.user.id);
  }
}
