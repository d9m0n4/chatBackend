import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports: [
    TypeOrmModule.forFeature([File]),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', '..', 'uploads'),
    // }),
  ],
})
export class FilesModule {}
