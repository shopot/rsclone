import { TypePlacedCard, TypeCardSuit, TypeCard } from './../types';
import { MAX_ATTACKER_ROUND_SLOT } from '../constants';
import { Card } from './Card';
import { Deck } from './Deck';

export class Round {
  attackersCards: Card[];
  defenderCards: Card[];
  defenderCardsAtRoundStart: number;
  trumpSuit: TypeCardSuit;
  maxRoundSlots: number;
  startPlayerSocketId: string;
  lastOpenAttackerCard: TypeCard | null;
  lastCloseDefenderCard: TypeCard | null;

  constructor(deck: Deck) {
    this.attackersCards = [];
    this.defenderCards = [];
    this.defenderCardsAtRoundStart = 0;
    this.trumpSuit = deck.getTrumpSuit();
    this.maxRoundSlots = MAX_ATTACKER_ROUND_SLOT - 1;
    this.startPlayerSocketId = '';
    this.lastOpenAttackerCard = null;
    this.lastCloseDefenderCard = null;
  }

  public getStartPlayerSocketId(): string {
    return this.startPlayerSocketId;
  }

  public setDefenderCardsAtRoundStart(quantity: number) {
    this.defenderCardsAtRoundStart = quantity;
  }

  public setStartPlayerSocketId(socketId: string): void {
    this.startPlayerSocketId = socketId;
  }

  public restart(): void {
    this.attackersCards = [];
    this.defenderCards = [];
    this.maxRoundSlots = MAX_ATTACKER_ROUND_SLOT;
  }

  public attack(card: Card) {
    // Has limit, can't add new card
    if (this.attackersCards.length >= this.maxRoundSlots) {
      return false;
    }

    // It is a first card
    if (this.attackersCards.length === 0) {
      this.attackersCards.push(card);

      // Save last open card
      this.lastOpenAttackerCard = card.getCardDto();

      return true;
    }

    // card with same rank already present on the table
    if (
      [...this.attackersCards, ...this.defenderCards].some(
        (cardOnTable) => cardOnTable.rank === card.rank,
      )
    ) {
      // Save last open card
      this.lastOpenAttackerCard = card.getCardDto();

      this.attackersCards.push(card);

      return true;
    }

    return false;
  }

  public defend(card: Card) {
    // Check is beating or not, check card, etc.
    // If is beating then returns true;
    const lastAttackCard = this.attackersCards[this.attackersCards.length - 1];

    if (card.canBeat(lastAttackCard, this.trumpSuit)) {
      this.defenderCards.push(card);

      // Save last close card
      this.lastCloseDefenderCard = card.getCardDto();

      return true;
    }

    return false;
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

  public isFinished(): boolean {
    return (
      this.attackersCards.length ===
      Math.min(this.defenderCardsAtRoundStart, this.maxRoundSlots)
    );
  }

  public getLastOpenAttackerCard(): TypeCard | null {
    return this.lastOpenAttackerCard;
  }

  public getLastCloseDefenderCard(): TypeCard | null {
    return this.lastCloseDefenderCard;
  }
}
