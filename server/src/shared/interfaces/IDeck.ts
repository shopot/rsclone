import { Card } from '../libs/Card';

export interface IDeck {
  cards: Card[];
  size: number;

  add: (cards: Card[]) => void;
  fill: () => void;
  shuffle: () => void;
  takeCards: (quantity: number) => Card[];
  getTopCard: () => void;
}
