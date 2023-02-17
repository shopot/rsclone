import {
  TypeCardRank,
  TypeCardSuit,
  TypeGameAction,
  TypePlayerRole,
  TypePlayerStatus,
  TypeRoomStatus,
} from '../../shared/types';
import { ITestCase } from '../RoomTestFactory';

/**
 * Defender отбил все карты, attacker берет последние карты с колоды и проигрывает
 */

export const case2xNoCardsFromDealtForDefenderWins: ITestCase = {
  testName: 'case2xNoCardsFromDealtForDefenderWins',
  roomStatus: TypeRoomStatus.GameInProgress,
  hostSocketIdIndex: 0,
  activeSocketIdIndex: 0,
  attackerIndex: 0,
  defenderIndex: 1,
  players: [
    {
      playerRole: TypePlayerRole.Attacker,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_K,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_Q,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_Q,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_Q,
          suit: TypeCardSuit.Spades,
        },
      ],
    },
    {
      playerRole: TypePlayerRole.Defender,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_8,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_J,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_K,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_K,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Spades,
        },
      ],
    },
  ],
  trumpCard: {
    rank: TypeCardRank.RANK_6,
    suit: TypeCardSuit.Clubs,
  },
  deck: [
    {
      rank: TypeCardRank.RANK_7,
      suit: TypeCardSuit.Clubs,
    },
    {
      rank: TypeCardRank.RANK_9,
      suit: TypeCardSuit.Clubs,
    },
  ],
  placedCards: [], // Zero, maybe need to fill
  dealt: [],
  isDealtEnabled: false,
  currentRound: 99,
  lastGameAction: TypeGameAction.DefenderMoveCard,
  beatCardsArray: [],
  beatCardsPlacedArray: [],
  lastOpenAttackerCard: {
    rank: TypeCardRank.RANK_7,
    suit: TypeCardSuit.Hearts,
  },
  lastCloseDefenderCard: {
    rank: TypeCardRank.RANK_8,
    suit: TypeCardSuit.Hearts,
  },
};
