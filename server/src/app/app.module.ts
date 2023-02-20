import { UPLOADED_FILES_DESTINATION } from './../config/index';
import { AuthModule } from '../modules/auth/auth.module';
import { UserModule } from '../modules/user/user.module';
import { Module } from '@nestjs/common';
import { GameModule } from '../modules/game/game.module';
import { HistoryModule } from '../modules/history/history.module';
import { RatingModule } from '../modules/rating/rating.module';
import { DatabaseModule } from '../database';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import appLoggerConfig from './app-logger.config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    AuthModule,
    UserModule,
    GameModule,
    HistoryModule,
    RatingModule,
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    WinstonModule.forRoot(appLoggerConfig),
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
})
export class AppModule {}
