import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';
import { CardDto } from '../dto';
import { ICard } from '../interfaces';
import { ICardDto } from '../interfaces/ICardDto';

export class Card implements ICard, ICardDto {
  rank: TypeCardRank;
  suit: TypeCardSuit;
  isTrump: boolean;

  constructor(rank: TypeCardRank, suit: TypeCardSuit) {
    this.rank = rank;
    this.suit = suit;
    this.isTrump = false;
  }

  setTrump(flag: boolean) {
    this.isTrump = flag;
  }

  canBeat(otherCard: Card, trumpSuit: TypeCardSuit): boolean {
    if (this.suit !== trumpSuit && otherCard.suit === trumpSuit) {
      return false;
    } else if (this.suit === trumpSuit && otherCard.suit !== trumpSuit) {
      return true;
    }

    return this.suit === otherCard.suit && this.rank > otherCard.rank;
  }

  getCardDto(): ICardDto {
    return CardDto.create(this.rank, this.suit);
  }

  static create(cardDto: ICardDto, trumpSuit: TypeCardSuit): Card {
    const card = new Card(cardDto.rank, cardDto.suit);

    card.setTrump(card.suit === trumpSuit);

    return card;
  }
}
