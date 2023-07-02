import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';

@Controller('dialog')
export class DialogController {
  constructor(private readonly dialogService: DialogService) {}

  @Post()
  create(@Body() createDialogDto: CreateDialogDto) {
    return this.dialogService.create(createDialogDto);
  }

  @Get()
  findAll() {
    return this.dialogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dialogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDialogDto: UpdateDialogDto) {
    return this.dialogService.update(+id, updateDialogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dialogService.remove(+id);
  }
}
