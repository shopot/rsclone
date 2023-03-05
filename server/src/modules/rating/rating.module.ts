import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database';
import { ratingProviders } from './rating.providers';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';

@Module({
  providers: [RatingService, ...ratingProviders],
  imports: [DatabaseModule],
  exports: [RatingService],
  controllers: [RatingController],
})
export class RatingModule {}
