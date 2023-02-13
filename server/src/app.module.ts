import { Module } from '@nestjs/common';

import { GameModule } from './game/game.module';
import { EntranceModule } from './entrance/entrance.module';
import { HistoryModule } from './history/history.module';
import { RatingModule } from './rating/rating.module';
import { DatabaseModule } from './database';

@Module({
  imports: [
    GameModule,
    EntranceModule,
    HistoryModule,
    RatingModule,
    DatabaseModule,
  ],
})
export class AppModule {}
