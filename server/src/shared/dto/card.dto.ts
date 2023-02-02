import { ICard } from '../interfaces';
import { ICardDto } from '../interfaces/ICardDto';
import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';

/**
 * Class for Data Transfer Object
 */
export class CardDto implements ICardDto {
  readonly rank: TypeCardRank;
  readonly suit: TypeCardSuit;

  constructor(rank: TypeCardRank, suit: TypeCardSuit) {
    this.rank = rank;
    this.suit = suit;
  }

  static create(rank: TypeCardRank, suit: TypeCardSuit): ICardDto {
    return new CardDto(rank, suit);
  }

  static createFromCard(card: ICard): ICardDto {
    return card.getCardDto();
  }
}
