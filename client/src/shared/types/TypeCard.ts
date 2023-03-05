import { TypeCardSuit } from './TypeCardSuit';
import { TypeCardRank } from './TypeCardRank';

export type TypeCard = {
  rank: TypeCardRank;
  suit: TypeCardSuit;
};
