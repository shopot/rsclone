import { TypeSortOrder } from '../../shared/types';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RATING_ROWS_LIMIT } from './constants';
import { ICreateRatingDto, IReturnRatingDto, IUpdateRatingDto } from './dto';
import { Rating } from './models/rating.entity';
import { Logger as WinstonLogger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class RatingService {
  constructor(
    @Inject('RATING_REPOSITORY')
    private RatingRepository: Repository<Rating>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  /**
   * Returns last RATING_ROWS_LIMIT results
   *
   * @returns Array list of Rating
   */
  public async findAll(): Promise<IReturnRatingDto[]> {
    this.RatingRepository.createQueryBuilder();

    const results = await this.RatingRepository.find({
      order: {
        wins: TypeSortOrder.Desc,
      },
      take: RATING_ROWS_LIMIT,
    });

    return results;
  }

  public async findOne(player: string): Promise<Rating | null> {
    return this.RatingRepository.findOneBy({ player });
  }

  /**
   * Create new Rating row
   *
   * @param {ICreateRatingDto} dto
   * @returns
   */
  async create(dto: ICreateRatingDto): Promise<void> {
    try {
      await this.RatingRepository.save(dto, {
        reload: false,
      });
    } catch {
      this.logger.error('Insert createRatingDto:');
      this.logger.error(dto);
    }
  }

  /**
   * Update Rating row
   *
   * @param {IUpdateRatingDto} dto
   */
  async update(dto: IUpdateRatingDto): Promise<void> {
    try {
      this.RatingRepository.createQueryBuilder()
        .update(Rating)
        .set({ ...dto })
        .where('userId = :userId', { userId: dto.userId })
        .execute();
    } catch {
      this.logger.error('Update updateRatingDto:');
      this.logger.error(dto);
    }
  }
}
