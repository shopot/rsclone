import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';
import { MAX_ATTACKS } from '../constants';
import { Card } from './Card';

type TypeCardProperty = {
  rank: TypeCardRank;
  suit: TypeCardSuit;
};

type TypeRoundCards = {
  attackerCards: TypeCardProperty[];
  defenderCards: TypeCardProperty[];
};

export class Round {
  attackersCards: Card[] = [];
  defenderCards: Card[] = [];
  trumpSuit: TypeCardSuit;
  maxRoundSlots = MAX_ATTACKS;

  // private players: Player[];

  attack(card: Card) {
    // Has limit, can't add new card
    if (this.attackersCards.length >= this.maxRoundSlots) {
      return false;
    }

    // It is a first card
    if (this.attackersCards.length === 0) {
      this.attackersCards.push(card);

      return true;
    }

    // card with same rank already present on the table
    if (
      [...this.attackersCards, ...this.defenderCards].some(
        (cardOnTable) => cardOnTable.rank === card.rank,
      )
    ) {
      this.attackersCards.push(card);
      return true;
    }

    return false;
  }

  defend(card: Card) {
    // Check is beating or not, check card, etc.
    // If is beating then returns true;
    const lastAttackCard = this.attackersCards[this.attackersCards.length - 1];

    if (card.canBeat(lastAttackCard, this.trumpSuit)) {
      this.defenderCards.push(card);
      return true;
    }

    return false;
  }

  isRoundEnded(): boolean {
    return (
      this.attackersCards.length === this.maxRoundSlots &&
      this.defenderCards.length === this.maxRoundSlots
    );
  }

  getRoundCards(): TypeRoundCards {
    return {
      attackerCards: this.attackersCards.map((card) => card.getCard()),
      defenderCards: this.defenderCards.map((card) => card.getCard()),
    };
  }

  getAttackerCards(): Card[] {
    return this.attackersCards;
  }

  getDefenderCards(): Card[] {
    return this.defenderCards;
  }
}
