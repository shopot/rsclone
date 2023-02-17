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
 * игрок1 подкидывает второму игроку2 6-ки. игрок2 всё бьет 7-ми и 8-ми,
 * 8-ки подкидывает игрок3, в результате ничья
 */
export const case3xLastRoundDrawWins: ITestCase = {
  testName: 'case3xLastRoundDrawWins',
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
          rank: TypeCardRank.RANK_6,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_6,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_6,
          suit: TypeCardSuit.Spades,
        },
        {
          rank: TypeCardRank.RANK_6,
          suit: TypeCardSuit.Hearts,
        },
      ],
    },
    {
      playerRole: TypePlayerRole.Defender,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_7,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_7,
          suit: TypeCardSuit.Spades,
        },
        {
          rank: TypeCardRank.RANK_8,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_8,
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
      playerRole: TypePlayerRole.Waiting,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_8,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_8,
          suit: TypeCardSuit.Spades,
        },
      ],
    },
  ],
  trumpCard: {
    rank: TypeCardRank.RANK_8,
    suit: TypeCardSuit.Hearts,
  },
  deck: [],
  placedCards: [], // Zero, maybe need to fill
  dealt: [],
  isDealtEnabled: false,
  currentRound: 99,
  lastGameAction: TypeGameAction.DefenderMoveCard,
  beatCardsArray: [],
  beatCardsPlacedArray: [],
  lastOpenAttackerCard: {
    rank: TypeCardRank.RANK_J,
    suit: TypeCardSuit.Hearts,
  },
  lastCloseDefenderCard: {
    rank: TypeCardRank.RANK_Q,
    suit: TypeCardSuit.Hearts,
  },
};
