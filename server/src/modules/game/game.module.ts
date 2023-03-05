import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { RatingModule } from '../rating/rating.module';
import { HistoryModule } from './../history/history.module';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  providers: [GameService, GameGateway],
  imports: [HistoryModule, RatingModule, UserModule],
})
export class GameModule {}
