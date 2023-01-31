import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';

export interface ICard {
  rank: TypeCardRank;
  suit: TypeCardSuit;

  canBeat: (otherCard: ICard, trumpSuit: TypeCardSuit) => boolean;
}
