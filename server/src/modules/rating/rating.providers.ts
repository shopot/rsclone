import { DataSource } from 'typeorm';
import { Rating } from './models/rating.entity';

export const ratingProviders = [
  {
    provide: 'RATING_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Rating),
    inject: ['DATABASE_SOURCE'],
  },
];
