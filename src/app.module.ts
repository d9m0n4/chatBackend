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
import { GatewayModule } from './gateway/app.gateway.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FilesModule } from './files/files.module';
import { File } from './files/entities/file.entity';
import { UserAvatar } from './user/entities/userAvatar.entity';
import { FavoritesMessage } from './message/entities/favoritesMessages.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   // useFactory: (configService: ConfigService) => ({
    //   //   type: 'postgres',
    //   //   host: process.env.DBHOST,
    //   //   port: +process.env.DBPORT,
    //   //   database: process.env.DBNAME,
    //   //   username: process.env.DBUSER,
    //   //   password: process.env.DBPASS,
    //   //   entities: [User, Dialog, Message, File, UserAvatar, FavoritesMessage],
    //   //   synchronize: true,
    //   // }),
    //   // inject: [ConfigService],
    // }),
    // EventEmitterModule.forRoot(),
    // UserModule,
    // AuthModule,
    // MessageModule,
    // DialogModule,
    // GatewayModule,
    // FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
