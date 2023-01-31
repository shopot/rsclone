import { IDeck } from '../interfaces/IDeck';
import { Card } from './Card';
import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';

export class Deck implements IDeck {
  cards;

  constructor(cards: Card[] = []) {
    this.cards = cards;
  }

  get size() {
    return this.cards.length;
  }

  add(cards: Card[]) {
    this.cards.push(...cards);
  }

  fill() {
    const ranks: TypeCardRank[] = [
      TypeCardRank.RANK_6,
      TypeCardRank.RANK_7,
      TypeCardRank.RANK_8,
      TypeCardRank.RANK_9,
      TypeCardRank.RANK_10,
      TypeCardRank.RANK_J,
      TypeCardRank.RANK_Q,
      TypeCardRank.RANK_K,
      TypeCardRank.RANK_A,
    ];
    const suits: TypeCardSuit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

    this.cards = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(rank, suit));
      }
    }
  }

  shuffle() {
    for (let i = this.size - 1; i > 0; i -= 1) {
      const randomCardIdx = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[randomCardIdx]] = [
        this.cards[randomCardIdx],
        this.cards[i],
      ];
    }
  }

  takeCards(quantity: number) {
    return this.cards.splice(this.size - Math.min(quantity, this.size));
  }
}
