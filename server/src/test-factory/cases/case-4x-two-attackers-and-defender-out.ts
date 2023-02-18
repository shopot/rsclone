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
 * Игрок1 атакует своими двумя шестерками и остается без карт. Ход переходит к следующему атакующему - игроку 3
 * Игрок3 подкидывает две свои шестерки и тоже выходит из игры до конца раунда
 * Игрок2 (защищающийся), отбиваясь остается без карт и начинается новый раунд
 */
export const case4xTwoAttackersAndDefenderOut: ITestCase = {
  testName: 'case4xTwoAttackersAndDefenderOut',
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
      ],
    },
    {
      playerRole: TypePlayerRole.Waiting,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_6,
          suit: TypeCardSuit.Spades,
        },
        {
          rank: TypeCardRank.RANK_6,
          suit: TypeCardSuit.Diamonds,
        },
      ],
    },
    {
      playerRole: TypePlayerRole.Waiting,
      playerStatus: TypePlayerStatus.InGame,
      cards: [
        {
          rank: TypeCardRank.RANK_9,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_9,
          suit: TypeCardSuit.Spades,
        },
      ],
    },
  ],
  trumpCard: {
    rank: TypeCardRank.RANK_8,
    suit: TypeCardSuit.Hearts,
  },
  deck: [
    {
      rank: TypeCardRank.RANK_8,
      suit: TypeCardSuit.Hearts,
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
    rank: TypeCardRank.RANK_J,
    suit: TypeCardSuit.Hearts,
  },
  lastCloseDefenderCard: {
    rank: TypeCardRank.RANK_Q,
    suit: TypeCardSuit.Hearts,
  },
};
