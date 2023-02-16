import { Module } from '@nestjs/common';

import { GameModule } from '../game/game.module';
import { HistoryModule } from '../history/history.module';
import { RatingModule } from '../rating/rating.module';
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
