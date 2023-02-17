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
 * игрок1 подкидывает второму игроку 7-ки. игрок2 всё бьет 8-ками и остается без карт
 * из колоды ему ничего не достается
 */
export const case3xDefenderWithNoCards: ITestCase = {
  testName: 'case3xDefenderWithNoCards',
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
          rank: TypeCardRank.RANK_7,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_7,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_7,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_7,
          suit: TypeCardSuit.Spades,
        },
        {
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Spades,
        },
        {
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Hearts,
        },
      ],
    },
    {
      playerRole: TypePlayerRole.Defender,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_8,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_8,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_8,
          suit: TypeCardSuit.Hearts,
        },
      ],
    },
    {
      playerRole: TypePlayerRole.Waiting,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_J,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_Q,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_9,
          suit: TypeCardSuit.Spades,
        },
        {
          rank: TypeCardRank.RANK_6,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_6,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_9,
          suit: TypeCardSuit.Diamonds,
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
      rank: TypeCardRank.RANK_K,
      suit: TypeCardSuit.Spades,
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
