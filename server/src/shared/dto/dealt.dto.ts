import { Card } from './../libs/Card';
import { CardDto } from './card.dto';

export class DealtDto {
  public socketId: string;
  public cards: CardDto[];
  public count: number;

  constructor(socketId: string, cards: Card[]) {
    this.socketId = socketId;
    this.cards = cards.map((card) => card.getCardDto());
    this.count = cards.length;
  }

  static create(socketId: string, cards: Card[]) {
    return new DealtDto(socketId, cards);
  }
}
