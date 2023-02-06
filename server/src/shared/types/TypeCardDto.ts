import { TypeCardRank } from './TypeCardRank';
import { TypeCardSuit } from './TypeCardSuit';

export type TypeCardDto = {
  readonly rank: TypeCardRank;
  readonly suit: TypeCardSuit;
};
