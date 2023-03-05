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
 * игрок2 подкидывает второму игроку1 начиная с 6-ки. игрок2 всё бьет 7-ми и потом 10-ми,
 * 10-ки подкидывает игрок3, игрок2 и игрок3 остается без карт
 * игрок1 проигрывает так как на руках у него остается 2 карты
 */
export const case3xDefenderLoserWith2Cards: ITestCase = {
  testName: 'case3xDefenderLoserWith2Cards',
  roomStatus: TypeRoomStatus.GameInProgress,
  hostSocketIdIndex: 0,
  activeSocketIdIndex: 1,
  attackerIndex: 1,
  defenderIndex: 0,
  players: [
    {
      playerRole: TypePlayerRole.Defender,
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
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Spades,
        },
        {
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Hearts,
        },
        {
          rank: TypeCardRank.RANK_Q,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_Q,
          suit: TypeCardSuit.Diamonds,
        },
        {
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_A,
          suit: TypeCardSuit.Diamonds,
        },
      ],
    },
    {
      playerRole: TypePlayerRole.Attacker,
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
          rank: TypeCardRank.RANK_6,
          suit: TypeCardSuit.Clubs,
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
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Clubs,
        },
        {
          rank: TypeCardRank.RANK_10,
          suit: TypeCardSuit.Diamonds,
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
