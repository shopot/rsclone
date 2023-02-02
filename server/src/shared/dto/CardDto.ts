import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';

/**
 * Class for Data Transfer Object
 */
export class CardDto {
  readonly rank: TypeCardRank;
  readonly suit: TypeCardSuit;

  constructor(rank: TypeCardRank, suit: TypeCardSuit) {
    this.rank = rank;
    this.suit = suit;
  }

  static create(rank: TypeCardRank, suit: TypeCardSuit) {
    return new CardDto(rank, suit);
  }
}
