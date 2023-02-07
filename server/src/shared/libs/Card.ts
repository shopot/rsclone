import { TypeCard, TypeCardRank, TypeCardSuit } from './../types';

export class Card {
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

  getCardDto(): TypeCard {
    return {
      rank: this.rank,
      suit: this.suit,
    };
  }

  static create(cardDto: TypeCard, trumpSuit: TypeCardSuit): Card {
    const card = new Card(cardDto.rank, cardDto.suit);

    card.setTrump(card.suit === trumpSuit);

    return card;
  }
}
