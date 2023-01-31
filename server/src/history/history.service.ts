import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { HISTORY_ROWS_LIMIT } from './constants';
import { CreateHistoryDto, ReturnHistoryDto, UpdateHistoryDto } from './dto';
import { SortOrder } from './history.types';
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
        id: SortOrder.Desc,
      },
      take: HISTORY_ROWS_LIMIT,
    });

    return results.map((item) => {
      // exclude id, roomId
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { roomId, ...results } = item;

      return { ...results, players: results.players.split('#') };
    });
  }

  /**
   * Create new history row
   *
   * @param createHistoryDto
   * @returns
   */
  async create(createHistoryDto: CreateHistoryDto): Promise<History> {
    const createdHistory = await this.historyRepository.save(createHistoryDto);

    return createdHistory;
  }

  /**
   * Update history row
   *
   * @param updateHistoryDto
   */
  async update(updateHistoryDto: UpdateHistoryDto): Promise<void> {
    const { roomId, ...data } = updateHistoryDto;

    this.historyRepository
      .createQueryBuilder()
      .update(History)
      .set({ ...data })
      .where('roomId = :roomId', { roomId: roomId })
      .execute();
  }
}
