import { Card } from './Card';
import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';

export class Deck {
  cards: Card[];
  trump: Card;

  constructor(numberOfPlayers = 2) {
    this.cards = [];

    // Initial deck
    this.fill();
    this.shuffle();

    this.trump = this.cards[numberOfPlayers * 6];

    // Set trump
    for (const card of this.cards) {
      card.setTrump(card.suit === this.getTrumpSuit());
    }
  }

  getTrumpSuit() {
    return this.trump.suit;
  }

  /**
   * Get numbers of cards in the deck
   */
  get size() {
    return this.cards.length;
  }

  /**
   * Add new card to the deck
   * @param cards
   */
  add(cards: Card[]) {
    this.cards.push(...cards);
  }

  /**
   * Fill the deck with cards
   */
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

    const suits: TypeCardSuit[] = Object.values(TypeCardSuit);

    this.cards = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(rank, suit));
      }
    }
  }

  /**
   * Shuffle the deck
   */
  shuffle() {
    for (let i = this.size - 1; i > 0; i -= 1) {
      const randomCardIdx = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[randomCardIdx]] = [
        this.cards[randomCardIdx],
        this.cards[i],
      ];
    }
  }

  /**
   * Returns cards from the deck
   * @param {number} quantity Number of cards
   * @returns Array of cards
   */
  getCardsFromDeck(quantity: number) {
    return this.cards.splice(this.size - Math.min(quantity, this.size));
  }

  isEmpty() {
    return this.cards.length === 0;
  }
}
