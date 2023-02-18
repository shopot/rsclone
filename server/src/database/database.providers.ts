import { History } from '../modules/history/models/history.entity';
import { Rating } from '../modules/rating/models/rating.entity';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATABASE_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'sqlite',
        database: 'db/durak_online.db',
        entities: [History, Rating],
        synchronize: true, // shouldn't be used in production
      });

      return dataSource.initialize();
    },
  },
];
