import { Module } from '@nestjs/common';

import { GameModule } from './game/game.module';
import { HistoryModule } from './history/history.module';
import { RatingModule } from './rating/rating.module';
import { DatabaseModule } from './database';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    GameModule,
    HistoryModule,
    RatingModule,
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
