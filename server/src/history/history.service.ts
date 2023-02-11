import { TypeSortOrder } from './../shared/types';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InsertResult, QueryFailedError, Repository } from 'typeorm';
import { HISTORY_ROWS_LIMIT } from './constants';
import { CreateHistoryDto, ReturnHistoryDto } from './dto';
import { History } from './models/history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @Inject('HISTORY_REPOSITORY')
    private historyRepository: Repository<History>,
  ) {}

  /**
   * Returns last HISTORY_ROWS_LIMIT results
   *
   * @returns Array list of history
   */
  public async getAll(): Promise<ReturnHistoryDto[]> {
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
  async create(createHistoryDto: CreateHistoryDto): Promise<void> {
    try {
      await this.historyRepository
        .createQueryBuilder()
        .insert()
        .into(History)
        .values({
          roomId: createHistoryDto.roomId,
          players: createHistoryDto.players,
          loser: createHistoryDto.loser,
          duration: createHistoryDto.duration,
          rounds: createHistoryDto.rounds,
        })
        .execute();
    } catch {
      Logger.error('Insert createHistoryDto to History:');
      Logger.error(createHistoryDto);
    }
  }
}
