import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dialog } from './entities/dialog.entity';
import { In, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { ReturnUserDto } from '../user/dto/return-user.dto';

@Injectable()
export class DialogService {
  constructor(
    @InjectRepository(Dialog)
    private readonly dialogRepository: Repository<Dialog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(partner: number, userId: number) {
    try {
      const users = await this.userRepository.findBy({
        id: In([partner, userId]),
      });
      if (users.length < 2) {
        throw new NotFoundException();
      }
      const dialog = new Dialog();
      dialog.users = users;

      return this.dialogRepository.save(dialog);
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
