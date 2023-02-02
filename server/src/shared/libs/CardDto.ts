import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';
import { Card } from './Card';

/**
 * Class for Data Transfer Object
 */
export class CardDto {
  rank: TypeCardRank;
  suit: TypeCardSuit;

  constructor(rank: TypeCardRank, suit: TypeCardSuit) {
    this.rank = rank;
    this.suit = suit;
  }

  static create(rank: TypeCardRank, suit: TypeCardSuit) {
    return new CardDto(rank, suit);
  }
}
