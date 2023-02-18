import { Controller, Get } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('/v1/history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  async findAll() {
    return await this.historyService.findAll();
  }
}
