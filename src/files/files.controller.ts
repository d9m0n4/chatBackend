import { FilesService } from './files.service';
import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getFilesByDialogId(@Query('dialogId') dialogId: number, @Req() req) {
    return await this.filesService.getByDialogId(dialogId);
  }
}
