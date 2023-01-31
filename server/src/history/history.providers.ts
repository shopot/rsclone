import { DataSource } from 'typeorm';
import { History } from './models/history.entity';

export const historyProviders = [
  {
    provide: 'HISTORY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(History),
    inject: ['DATABASE_SOURCE'],
  },
];
