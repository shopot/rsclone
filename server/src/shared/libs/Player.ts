import { IPlayer } from '../interfaces/IPlayer';
import { Card } from './Card';
import { TypePlayerStatus } from '../types/TypePlayerStatus';

export class Player implements IPlayer {
  id; // socket.id
  name;
  cards: Card[];
  status;
  isDefending;

  constructor(id: string, name: string, status: TypePlayerStatus = 'regular') {
    this.id = id;
    this.name = name;
    this.cards = [];
    this.status = status;
    this.isDefending = false;
  }
}
