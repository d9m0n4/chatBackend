import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { access, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import * as sharp from 'sharp';
import { FileM, FileWithName } from './types/FileM';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { isArray } from 'class-validator';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  async getByDialogId(dialogId: number) {
    return this.fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.dialog', 'dialog')
      .where('dialog.id = :dialogId', { dialogId })
      .select([
        'file',
        // 'dialog.id'
      ])
      .getMany();
  }

  async save(entry: FileWithName | Array<FileWithName>): Promise<FileM[]> {
    if (!entry) {
      return;
    }
    const filesFolder = join(__dirname, '..', '..', 'uploads');

    try {
      await access(filesFolder);
    } catch (error) {
      await mkdir(filesFolder, { recursive: true });
    }

    if (isArray(entry)) {
      return await Promise.all(
        entry.map(async (file) => {
          return await this.writeFile(file, filesFolder);
        }),
      );
    } else {
      return Array(await this.writeFile(entry, filesFolder));
    }
  }

  async writeFile(file, folder) {
    try {
      await writeFile(join(folder, file.name), file.buffer);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('ошибка записи файлов');
    }
    return {
      ...file,
      url: `/uploads/${file.name}`,
      name: file.name,
      ext: file.name.split('.').pop(),
      fileType: file.mimetype.split('/').pop(),
    };
  }

  async createFile(file) {
    if (!file) {
      return;
    }
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
          name: `${fileName}.webp`,
          mimetype,
        };
      }
      return {
        ...file,
        buffer: file.buffer,
        name: `${fileName}.svg`,
        mimetype,
      };
    }
    return {
      ...file,
      buffer: file.buffer,
      name: `${fileName}.${type}`,
      mimetype,
    };
  }

  async filterFiles(entry: Array<Express.Multer.File> | Express.Multer.File) {
    if (isArray(entry)) {
      return await Promise.all(
        entry.map(async (file) => {
          return await this.createFile(file);
        }),
      );
    } else {
      return await this.createFile(entry);
    }
  }

  async generateFileName() {
    return Array(18)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
  }

  convertToWebP(file: Buffer) {
    return sharp(file).webp().toBuffer();
  }
}
