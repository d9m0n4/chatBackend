import { Injectable } from '@nestjs/common';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dialog } from './entities/dialog.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DialogService {
  constructor(
    @InjectRepository(Dialog)
    private dialogRepository: Repository<Dialog>,
  ) {}
  create(createDialogDto: CreateDialogDto) {
    return this.dialogRepository.save(createDialogDto);
  }

  findAll() {
    return `This action returns all dialog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dialog`;
  }

  update(id: number, updateDialogDto: UpdateDialogDto) {
    return `This action updates a #${id} dialog`;
  }

  remove(id: number) {
    return `This action removes a #${id} dialog`;
  }
}
