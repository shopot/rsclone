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
 * У двух игроков по две карты на руках, они скидывают всё
 * В колоде есть еще 6 карт
 */

export const case2xLastRoundCardsInDeck: ITestCase = {
  testName: 'case2xLastRoundCardsInDeck',
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
  deck: [
    {
      rank: TypeCardRank.RANK_10,
      suit: TypeCardSuit.Diamonds,
    },
    {
      rank: TypeCardRank.RANK_J,
      suit: TypeCardSuit.Spades,
    },
    {
      rank: TypeCardRank.RANK_K,
      suit: TypeCardSuit.Hearts,
    },
    {
      rank: TypeCardRank.RANK_6,
      suit: TypeCardSuit.Spades,
    },
    {
      rank: TypeCardRank.RANK_7,
      suit: TypeCardSuit.Spades,
    },
    {
      rank: TypeCardRank.RANK_9,
      suit: TypeCardSuit.Hearts,
    },
  ], // Zero
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
