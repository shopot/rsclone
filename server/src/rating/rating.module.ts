import { Module } from '@nestjs/common';
import { RatingGateway } from './rating.gateway';

@Module({
  providers: [RatingGateway],
})
export class RatingModule {}
