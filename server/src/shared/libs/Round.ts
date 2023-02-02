import { TypeCardSuit } from '../types/TypeCardSuit';
import { MAX_ATTACKER_ROUND_SLOT } from '../constants';
import { Card } from './Card';
import { CardDto } from '../dto/card.dto';
import { Deck } from './Deck';

type TypeRoundCards = {
  attackerCards: CardDto[];
  defenderCards: CardDto[];
};

export class Round {
  attackersCards: Card[];
  defenderCards: Card[];
  trumpSuit: TypeCardSuit;
  maxRoundSlots: number;

  constructor(deck: Deck) {
    this.attackersCards = [];
    this.defenderCards = [];
    this.trumpSuit = deck.getTrumpSuit();
    this.maxRoundSlots = MAX_ATTACKER_ROUND_SLOT;
  }

  attack(cardDto: CardDto) {
    // Has limit, can't add new card
    if (this.attackersCards.length >= this.maxRoundSlots) {
      return false;
    }

    // Create card
    const card = Card.create(cardDto, this.trumpSuit);

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

  defend(cardDto: CardDto) {
    // Check is beating or not, check card, etc.
    // If is beating then returns true;
    const lastAttackCard = this.attackersCards[this.attackersCards.length - 1];

    const card = Card.create(cardDto, this.trumpSuit);

    if (card.canBeat(lastAttackCard, this.trumpSuit)) {
      this.defenderCards.push(card);
      return true;
    }

    return false;
  }

  isRoundFinished(): boolean {
    return (
      this.attackersCards.length === this.maxRoundSlots &&
      this.defenderCards.length === this.maxRoundSlots
    );
  }

  getRoundCards(): TypeRoundCards {
    return {
      attackerCards: this.attackersCards.map((card) => card.getCardDto()),
      defenderCards: this.defenderCards.map((card) => card.getCardDto()),
    };
  }

  getAttackerCards(): CardDto[] {
    return this.attackersCards.map((card) => card.getCardDto());
  }

  getDefenderCards(): Card[] {
    return this.defenderCards;
  }
}
