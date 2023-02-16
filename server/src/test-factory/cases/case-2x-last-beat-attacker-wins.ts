import {
  TypeCardRank,
  TypeCardSuit,
  TypeGameAction,
  TypePlayerRole,
  TypePlayerStatus,
  TypeRoomStatus,
} from '../../shared/types';
import { ITestCase } from '../RoomTestFactory';

export const case2xLastBeatAttackerWins: ITestCase = {
  testName: 'case2xLastBeatAttackerWins',
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
          suit: TypeCardSuit.Clubs,
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
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Diamonds,
        },
      ],
    },
  ],
  trumpCard: {
    rank: TypeCardRank.RANK_6,
    suit: TypeCardSuit.Clubs,
  },
  deck: [], // Zero
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
