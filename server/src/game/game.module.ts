import { HistoryModule } from './../history/history.module';
import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  providers: [GameService, GameGateway],
  imports: [HistoryModule],
})
export class GameModule {}
