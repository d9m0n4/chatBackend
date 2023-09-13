import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { access, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor() {}

  async save(files: Array<Express.Multer.File>, folder = 'files') {
    const filesFolder = join(__dirname, '..', '..', 'static', folder);

    try {
      await access(filesFolder);
    } catch (error) {
      await mkdir(filesFolder, { recursive: true });
    }

    const res = await Promise.all(
      files.map(async (file) => {
        try {
          await writeFile(join(filesFolder, file.originalname), file.buffer);
        } catch (error) {
          throw new InternalServerErrorException('ошибка записи файлов');
        }
        return {
          url: `/static/${folder}/${file.originalname}`,
          name: file.filename,
        };
      }),
    );
    return res;
  }
}
