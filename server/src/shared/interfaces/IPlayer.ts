import { Card } from '../libs/Card';

export interface IPlayer {
  id: string;
  name: string;
  cards: Card[];
  isDefending: boolean;
}
