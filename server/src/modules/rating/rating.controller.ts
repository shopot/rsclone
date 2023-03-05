import { RatingService } from './rating.service';
import { Controller, Get } from '@nestjs/common';

@Controller('/v1/rating')
export class RatingController {
  constructor(private ratingService: RatingService) {}

  @Get()
  async findAll() {
    return await this.ratingService.findAll();
  }
}
