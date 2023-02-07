import { TypePlacedCard, TypeCardSuit, TypeCard } from './../types';
import { MAX_ATTACKER_ROUND_SLOT } from '../constants';
import { Card } from './Card';
import { Deck } from './Deck';

export class Round {
  attackersCards: Card[];
  defenderCards: Card[];
  trumpSuit: TypeCardSuit;
  maxRoundSlots: number;

  constructor(deck: Deck) {
    this.attackersCards = [];
    this.defenderCards = [];
    this.trumpSuit = deck.getTrumpSuit();
    this.maxRoundSlots = MAX_ATTACKER_ROUND_SLOT - 1;
  }

  public restart(): void {
    this.attackersCards = [];
    this.defenderCards = [];
    this.maxRoundSlots = MAX_ATTACKER_ROUND_SLOT;
  }

  public attack(cardDto: TypeCard) {
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

  public defend(cardDto: TypeCard) {
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

  /**
   * Returns all cards from the round
   * @returns {Array<Card>} Round cards array
   */
  public getRoundCards(): Card[] {
    return this.attackersCards.concat(this.defenderCards);
  }

  public getRoundCardsAsPlaced(): TypePlacedCard[] {
    if (this.attackersCards.length === 0) {
      return [];
    }

    return this.attackersCards.map((card, idx) => {
      const placedCard: TypePlacedCard = {
        attacker: card.getCardDto(),
        defender: this.defenderCards[idx]
          ? this.defenderCards[idx].getCardDto()
          : null,
      };

      return placedCard;
    });
  }

  getAttackerCards(): TypeCard[] {
    return this.attackersCards.map((card) => card.getCardDto());
  }

  getDefenderCards(): Card[] {
    return this.defenderCards;
  }
}
