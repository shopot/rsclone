import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../auth/guards';
import { HistoryService } from './history.service';

@Controller('/v1/history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll() {
    return await this.historyService.findAll();
  }
}
