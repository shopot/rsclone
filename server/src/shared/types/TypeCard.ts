import { TypeCardRank } from './TypeCardRank';
import { TypeCardSuit } from './TypeCardSuit';

export type TypeCard = {
  readonly rank: TypeCardRank;
  readonly suit: TypeCardSuit;
};
