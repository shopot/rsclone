import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { historyProviders } from './history.providers';
import { DatabaseModule } from '../../database';
import { HistoryController } from './history.controller';

@Module({
  providers: [HistoryService, ...historyProviders],
  imports: [DatabaseModule],
  exports: [HistoryService],
  controllers: [HistoryController],
})
export class HistoryModule {}
