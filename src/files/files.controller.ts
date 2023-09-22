import { FilesService } from './files.service';
import {
  Controller,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('file', 3))
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    // @Query('folder') folder?: string,
  ) {
    return this.filesService.save(files);
  }
}
