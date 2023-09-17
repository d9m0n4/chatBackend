import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { access, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import * as sharp from 'sharp';

@Injectable()
export class FilesService {
  constructor() {}

  convertToWebP(file: Buffer) {
    return sharp(file).webp().toBuffer();
  }
  async save(files: Array<Express.Multer.File>, folder = 'files') {
    console.log('save', files);
    const filesFolder = join(__dirname, '..', '..', 'uploads');
    console.log(filesFolder);

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
          console.log(error);
          throw new InternalServerErrorException('ошибка записи файлов');
        }
        return {
          url: `/uploads/${file.originalname}`,
          name: file.originalname,
          ext: file.originalname.split('.').pop(),
        };
      }),
    );

    return res;
  }

  async filterFiles(files) {
    const newFiles = await Promise.all(
      files.map(async (file) => {
        const mimetype = file.mimetype;
        const fileType = file.mimetype.split('/').pop();
        const type = file.originalname.split('.').pop();

        if (mimetype.includes('image')) {
          if (fileType != 'svg+xml') {
            const buffer = await this.convertToWebP(file.buffer);
            return {
              buffer,
              originalname: `${file.originalname}.webp`,
              mimetype,
            };
          }
          return {
            buffer: file.buffer,
            originalname: `${file.originalname}.svg`,
            mimetype,
          };
        }
        return {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype,
        };
      }),
    );
    return newFiles;
  }
}
