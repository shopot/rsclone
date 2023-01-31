import { History } from '../history/models/history.entity';
import { Rating } from '../rating/models/rating.entity';
import { DataSource } from 'typeorm';

console.log(__dirname);

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
