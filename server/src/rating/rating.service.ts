import { TypeSortOrder } from './../shared/types';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RATING_ROWS_LIMIT } from './constants';
import { CreateRatingDto, ReturnRatingDto, UpdateRatingDto } from './dto';
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
  public async getAll(): Promise<ReturnRatingDto[]> {
    this.RatingRepository.createQueryBuilder();

    const results = await this.RatingRepository.find({
      order: {
        wins: TypeSortOrder.Desc,
      },
      take: RATING_ROWS_LIMIT,
    });

    return results;
  }

  /**
   * Create new Rating row
   *
   * @param createRatingDto
   * @returns
   */
  async create(createRatingDto: CreateRatingDto): Promise<Rating> {
    const createdRating = await this.RatingRepository.save(createRatingDto);

    return createdRating;
  }

  /**
   * Update Rating row
   *
   * @param updateRatingDto
   */
  async update(updateRatingDto: UpdateRatingDto): Promise<void> {
    const { player, ...results } = updateRatingDto;

    this.RatingRepository.createQueryBuilder()
      .update(Rating)
      .set({ ...results })
      .where('player = :player', { player: player })
      .execute();
  }
}
