import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database';
import { RatingGateway } from './rating.gateway';
import { ratingProviders } from './rating.providers';
import { RatingService } from './rating.service';

@Module({
  providers: [RatingGateway, RatingService, ...ratingProviders],
  imports: [DatabaseModule],
  exports: [RatingService],
})
export class RatingModule {}
