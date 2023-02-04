import { Card } from './../libs/Card';
import { CardDto } from './card.dto';

export class DealtDto {
  public playerId: string;
  public cards: CardDto[];
  public count: number;

  constructor(playerId: string, cards: Card[]) {
    this.playerId = playerId;
    this.cards = cards.map((card) => card.getCardDto());
    this.count = cards.length;
  }

  static create(playerId: string, cards: Card[]) {
    return new DealtDto(playerId, cards);
  }
}
