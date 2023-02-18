import { Module } from '@nestjs/common';

import { GameModule } from '../modules/game/game.module';
import { HistoryModule } from '../modules/history/history.module';
import { RatingModule } from '../modules/rating/rating.module';
import { DatabaseModule } from '../database';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import appLoggerConfig from './app-logger.config';

@Module({
  imports: [
    GameModule,
    HistoryModule,
    RatingModule,
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    WinstonModule.forRoot(appLoggerConfig),
  ],
})
export class AppModule {}
