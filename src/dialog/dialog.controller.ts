import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dialog')
export class DialogController {
  constructor(private readonly dialogService: DialogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { partner: number }, @Req() req) {
    const { partner } = body;
    return await this.dialogService.create(partner, req.user.id);
  }
}
