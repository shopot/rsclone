import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { EntranceModule } from './entrance/entrance.module';
import { HistoryModule } from './history/history.module';
import { RatingModule } from './rating/rating.module';
import { DatabaseModule } from './database';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    GameModule,
    EntranceModule,
    HistoryModule,
    RatingModule,
    DatabaseModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
