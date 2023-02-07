export const enum TypeCardRank {
  'RANK_6' = 6,
  'RANK_7',
  'RANK_8',
  'RANK_9',
  'RANK_10',
  'RANK_J',
  'RANK_Q',
  'RANK_K',
  'RANK_A',
}

export enum TypeCardSuit {
  Clubs = 'clubs', // ♣
  Spades = 'spades', // ♠
  Hearts = 'hearts', // ♥
  Diamonds = 'diamonds', // ♦
}

export type TypeCard = {
  readonly rank: TypeCardRank;
  readonly suit: TypeCardSuit;
};
