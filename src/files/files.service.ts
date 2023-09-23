import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { access, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import * as sharp from 'sharp';
import { FileM } from './types/FileM';

@Injectable()
export class FilesService {
  constructor() {}

  convertToWebP(file: Buffer) {
    return sharp(file).webp().toBuffer();
  }
  async save(files: Array<Express.Multer.File>): Promise<FileM[]> {
    const filesFolder = join(__dirname, '..', '..', 'uploads');

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
          ...file,
          url: `/uploads/${file.originalname}`,
          name: file.originalname,
          ext: file.originalname.split('.').pop(),
          fileType: file.mimetype.split('/').pop(),
        };
      }),
    );

    return res;
  }

  async filterFiles(files: Array<Express.Multer.File>) {
    const newFiles = await Promise.all(
      files.map(async (file) => {
        const mimetype = file.mimetype;
        const fileType = file.mimetype.split('/').pop();
        const fileName = await this.generateFileName();
        const type = file.originalname.split('.').pop();

        if (mimetype.includes('image')) {
          if (fileType != 'svg+xml') {
            const buffer = await this.convertToWebP(file.buffer);
            return {
              ...file,
              buffer,
              originalname: `${fileName}.webp`,
              mimetype,
            };
          }
          return {
            ...file,
            buffer: file.buffer,
            originalname: `${fileName}.svg`,
            mimetype,
          };
        }
        return {
          ...file,
          buffer: file.buffer,
          originalname: `${fileName}.${type}`,
          mimetype,
        };
      }),
    );
    return newFiles;
  }

  async generateFileName() {
    return Array(18)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
  }
}
