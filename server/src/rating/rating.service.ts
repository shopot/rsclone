import { TypeSortOrder } from './../shared/types';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RATING_ROWS_LIMIT } from './constants';
import { ICreateRatingDto, IReturnRatingDto, IUpdateRatingDto } from './dto';
import { Rating } from './models/rating.entity';

@Injectable()
export class RatingService {
  constructor(
    @Inject('RATING_REPOSITORY')
    private RatingRepository: Repository<Rating>,
  ) {}

  /**
   * Returns last RATING_ROWS_LIMIT results
   *
   * @returns Array list of Rating
   */
  public async getAll(): Promise<IReturnRatingDto[]> {
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
   * @param createRatingDto
   * @returns
   */
  async create(createRatingDto: ICreateRatingDto): Promise<void> {
    try {
      await this.RatingRepository.save(createRatingDto, {
        reload: false,
      });
    } catch {
      Logger.error('Insert createRatingDto:');
      Logger.error(createRatingDto);
    }
  }

  /**
   * Update Rating row
   *
   * @param updateRatingDto
   */
  async update(updateRatingDto: IUpdateRatingDto): Promise<void> {
    try {
      this.RatingRepository.createQueryBuilder()
        .update(Rating)
        .set({ ...updateRatingDto })
        .where('player = :player', { player: updateRatingDto.player })
        .execute();
    } catch {
      Logger.error('Update updateRatingDto:');
      Logger.error(updateRatingDto);
    }
  }
}
