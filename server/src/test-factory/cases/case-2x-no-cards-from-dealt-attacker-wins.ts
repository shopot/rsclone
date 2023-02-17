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
 * По шесть карт, отбивающийся не отбивает последнюю карту, attacker win
 * почему то у defender не устанавливается статус YOU_LOSER, хотя если ливать
 * из комнаты все записывается корректно
 */

export const case2xNoCardsFromDealtAttackerWins: ITestCase = {
  testName: 'case2xNoCardsFromDealtAttackerWins',
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
          rank: TypeCardRank.RANK_8,
          suit: TypeCardSuit.Spades,
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
