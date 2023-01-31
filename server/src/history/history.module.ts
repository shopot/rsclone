import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryGateway } from './history.gateway';
import { historyProviders } from './history.providers';
import { DatabaseModule } from 'src/database';

@Module({
  providers: [HistoryService, HistoryGateway, ...historyProviders],
  imports: [DatabaseModule],
})
export class HistoryModule {}
