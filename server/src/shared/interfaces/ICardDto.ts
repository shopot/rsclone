import { TypeCardRank } from '../types/TypeCardRank';
import { TypeCardSuit } from '../types/TypeCardSuit';

export interface ICardDto {
  rank: TypeCardRank;
  suit: TypeCardSuit;
}
