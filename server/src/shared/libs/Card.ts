import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';
import { ICard } from '../interfaces/ICard';

export class Card implements ICard {
  rank;
  suit;

  constructor(rank: TypeCardRank, suit: TypeCardSuit) {
    this.rank = rank;
    this.suit = suit;
  }

  canBeat(otherCard: Card, trumpSuit: TypeCardSuit) {
    if (this.suit !== trumpSuit && otherCard.suit === trumpSuit) {
      return false;
    } else if (this.suit === trumpSuit && otherCard.suit !== trumpSuit) {
      return true;
    }

    return this.suit === otherCard.suit && this.rank > otherCard.rank;
  }
}
