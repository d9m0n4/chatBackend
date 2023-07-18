import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { DialogModule } from './dialog/dialog.module';
import { Dialog } from './dialog/entities/dialog.entity';
import { MessageModule } from './message/message.module';
import { Message } from './message/entities/message.entity';
import { AttachmentModule } from './attachment/attachment.module';
import { Attachment } from './attachment/entities/attachment.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        database: process.env.DB_NAME,
        username: process.env.DB_USER_NAME,
        password: process.env.DB_PASSWORD,
        entities: [User, Dialog, Message, Attachment],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    AttachmentModule,
    MessageModule,
    DialogModule,
    MulterModule.register({
      dest: '../uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
