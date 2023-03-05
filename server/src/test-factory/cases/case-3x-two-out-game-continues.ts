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
 *
 * игрок3: 7♥
 * игрок2: 9♥
 * игрок3: pass
 * игрок1: pass
 *
 * игрок3: 10♥
 * игрок1: 9♦
 * игрок3: 10♣
 * игрок1: Q♣
 * игрок3: pass

 * игрок1: 8♥
 * игрок3: A♥
 * игрок1: pass

 * игрок3: 7♣
 * игрок1: 9♣
 * игрок3: pass

 * игрок1: 10♠
 * игрок3: take
 * игрок1: 10♦
 * игрок1: pass
 *
 *
 * ход всё еще у атакующего игрока1
 * игра всё еще в состоянии GameInProgress
 */
export const case3xTwoOutGameContinues: ITestCase = {
  testName: 'case3xTwoOutGameContinues',
  roomStatus: TypeRoomStatus.GameInProgress,
  hostSocketIdIndex: 0,
  activeSocketIdIndex: 2,
  attackerIndex: 2,
  defenderIndex: 1,
  players: [
    {
      playerRole: TypePlayerRole.Waiting,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Spades,
        },
      ],
    },
    {
      playerRole: TypePlayerRole.Defender,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_9,
          suit: TypeCardSuit.Hearts,
        },
      ],
    },
    {
      playerRole: TypePlayerRole.Attacker,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Spades,
        },
        {
          rank: TypeCardRank.RANK_7,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_7,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_J,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_J,
          suit: TypeCardSuit.Spades,
        },
        {
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_J,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Clubs,
        },
      ],
    },
  ],
  trumpCard: {
    rank: TypeCardRank.RANK_9,
    suit: TypeCardSuit.Diamonds,
  },
  deck: [
    { rank: TypeCardRank.RANK_9, suit: TypeCardSuit.Diamonds },
    { rank: TypeCardRank.RANK_8, suit: TypeCardSuit.Hearts },
    { rank: TypeCardRank.RANK_Q, suit: TypeCardSuit.Clubs },
    { rank: TypeCardRank.RANK_9, suit: TypeCardSuit.Clubs },
  ],
  placedCards: [
    {
      attacker: { rank: TypeCardRank.RANK_9, suit: TypeCardSuit.Spades },
      defender: { rank: TypeCardRank.RANK_Q, suit: TypeCardSuit.Spades },
    },
    {
      attacker: { rank: TypeCardRank.RANK_Q, suit: TypeCardSuit.Hearts },
      defender: { rank: TypeCardRank.RANK_K, suit: TypeCardSuit.Hearts },
    },
    {
      attacker: { rank: TypeCardRank.RANK_Q, suit: TypeCardSuit.Diamonds },
      defender: { rank: TypeCardRank.RANK_K, suit: TypeCardSuit.Diamonds },
    },
    {
      attacker: { rank: TypeCardRank.RANK_K, suit: TypeCardSuit.Spades },
      defender: { rank: TypeCardRank.RANK_7, suit: TypeCardSuit.Diamonds },
    },
    {
      attacker: { rank: TypeCardRank.RANK_7, suit: TypeCardSuit.Spades },
      defender: { rank: TypeCardRank.RANK_J, suit: TypeCardSuit.Diamonds },
    },
  ],
  dealt: [],
  isDealtEnabled: false,
  currentRound: 4,
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
