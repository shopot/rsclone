import { TypeSortOrder } from './../../shared/types';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { HISTORY_ROWS_LIMIT } from './constants';
import { ICreateHistoryDto, IReturnHistoryDto } from './dto';
import { History } from './models/history.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

@Injectable()
export class HistoryService {
  constructor(
    @Inject('HISTORY_REPOSITORY')
    private historyRepository: Repository<History>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  /**
   * Returns last HISTORY_ROWS_LIMIT results
   *
   * @returns Array list of history
   */
  public async findAll(): Promise<IReturnHistoryDto[]> {
    const results = await this.historyRepository.find({
      order: {
        id: TypeSortOrder.Desc,
      },
      take: HISTORY_ROWS_LIMIT,
    });

    return results.map((item) => {
      return { ...item, players: item.players.split('#') };
    });
  }

  public async findOne(roomId: string): Promise<History | null> {
    return this.historyRepository.findOneBy({ roomId });
  }

  /**
   * Create new history row
   *
   * @param createHistoryDto
   * @returns
   */
  async create(dto: ICreateHistoryDto): Promise<void> {
    try {
      await this.historyRepository.save(dto);
    } catch {
      this.logger.error('Insert createHistoryDto to History:');
      this.logger.error(dto);
    }
  }
}
