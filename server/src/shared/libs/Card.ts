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

  isEqual(otherCard: Card) {
    return this.rank === otherCard.rank && this.suit === otherCard.suit;
  }

  getCardDto(): TypeCard {
    return {
      rank: this.rank,
      suit: this.suit,
    };
  }

  toString() {
    let suit = '';
    switch (this.suit) {
      case TypeCardSuit.Clubs:
        suit = '♣';
        break;
      case TypeCardSuit.Diamonds:
        suit = '♦';
        break;
      case TypeCardSuit.Hearts:
        suit = '♥';
        break;
      case TypeCardSuit.Spades:
        suit = '♠';
        break;
    }

    let rank = '';
    switch (this.rank) {
      case TypeCardRank.RANK_J:
        rank = 'J';
        break;
      case TypeCardRank.RANK_Q:
        rank = 'Q';
        break;
      case TypeCardRank.RANK_K:
        rank = 'K';
        break;
      case TypeCardRank.RANK_A:
        rank = 'A';
        break;
      default:
        rank = this.rank.toString();
    }

    return `${rank}${suit}`;
  }

  static create(cardDto: TypeCard, trumpSuit: TypeCardSuit): Card {
    const card = new Card(cardDto.rank, cardDto.suit);

    card.setTrump(card.suit === trumpSuit);

    return card;
  }
}
