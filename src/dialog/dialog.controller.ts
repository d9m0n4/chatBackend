import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dialogs')
export class DialogController {
  constructor(private readonly dialogService: DialogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: { partner: number }, @Req() req) {
    const { partner } = body;
    return await this.dialogService.create(partner, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyDialogs(@Req() req) {
    return await this.dialogService.getMyDialogsWithUsers(req.user.id);
  }
}
