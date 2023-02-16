import { Logger } from '@nestjs/common';
import { Card } from '../shared/libs/Card';
import { Room } from '../shared/libs/Room';
import {
  TypeGameAction,
  TypePlacedCard,
  TypePlayerRole,
  TypePlayerStatus,
  TypeRoomStatus,
  TypeCard,
  TypeCardSuit,
} from '../shared/types';
import { testCases } from './cases';

interface ITestPlayer {
  playerRole: TypePlayerRole;
  playerStatus: TypePlayerStatus;
  cards: TypeCard[];
}

export interface ITestCase {
  testName: string;
  roomStatus: TypeRoomStatus;
  hostSocketIdIndex: number;
  activeSocketIdIndex: number;
  attackerIndex: number;
  defenderIndex: number;
  players: ITestPlayer[];
  trumpCard: TypeCard;
  deck: TypeCard[];
  // deckCounter: number; - get from deck[]
  placedCards: TypePlacedCard[];
  dealt: Array<{
    playerIndex: number;
    cards: TypeCard[];
  }>;
  isDealtEnabled: boolean;
  currentRound: number;
  lastGameAction: TypeGameAction;
  beatCardsArray: Array<TypeCard[]>;
  beatCardsPlacedArray: Array<TypePlacedCard[]>;
  lastOpenAttackerCard: TypeCard | null;
  lastCloseDefenderCard: TypeCard | null;
}

export class RoomTestFactory {
  room: Room;
  testCase: ITestCase | null;

  constructor(room: Room, testName: string) {
    this.room = room;

    if (testName && testName in testCases) {
      this.testCase = testCases[testName as keyof typeof testCases];
    } else {
      this.testCase = null;
    }
  }

  create(): void {
    if (this.testCase === null) {
      return;
    }

    Logger.debug(`Test case "${this.testCase.testName}" BEGIN`);

    const room = this.room;
    const testCase = this.testCase;

    // Set room TypeRoomStatus
    room.roomStatus = this.testCase.roomStatus || TypeRoomStatus.GameInProgress;

    const players = room.players.getAll();

    room.hostPlayer = players[testCase.hostSocketIdIndex];
    room.activePlayer = players[testCase.activeSocketIdIndex];
    room.attacker = players[testCase.attackerIndex];
    room.defender = players[testCase.defenderIndex];

    // init trump
    room.deck.trump = this.createCard(testCase.trumpCard);

    // init player
    players.forEach((player, index) => {
      player.playerRole = testCase.players[index].playerRole;

      player.playerStatus = testCase.players[index].playerStatus;

      player.cards = testCase.players[index].cards.map((cardDto) => {
        return this.createCard(cardDto);
      });
    });

    room.deck.cards = testCase.deck.map((cardDto) => {
      return this.createCard(cardDto);
    });

    room.round.attackersCards = [];
    room.round.defenderCards = [];

    // placedCards: TypePlacedCard[];
    testCase.placedCards.forEach((placedCard) => {
      room.round.attackersCards.push(this.createCard(placedCard.attacker));

      if (placedCard.defender) {
        room.round.defenderCards.push(this.createCard(placedCard.defender));
      }
    });

    // dealt: TypeDealt[];
    this.room.dealt = testCase.dealt.map((dealtItem) => {
      return {
        socketId: players[dealtItem.playerIndex].getSocketId(),

        cards: dealtItem.cards.map((cardDto) => {
          return this.createCard(cardDto);
        }),

        count: dealtItem.cards.length,
      };
    });

    // isDealtEnabled: boolean;
    room.isDealtEnabled =
      typeof testCase.isDealtEnabled === 'boolean'
        ? testCase.isDealtEnabled
        : false;

    // currentRound: number;
    room.currentRound = testCase.currentRound || 99;

    // lastGameAction: TypeGameAction;
    room.LastGameAction =
      testCase.lastGameAction || TypeGameAction.AttackerPass;

    // beatCardsArray: Array<TypeCard[]>;
    room.beatCardsArray = testCase.beatCardsArray;

    // beatCardsPlacedArray: Array<TypePlacedCard[]>;
    room.beatCardsPlacedArray = testCase.beatCardsPlacedArray;

    // lastOpenAttackerCard: TypeCard | null;
    room.lastOpenAttackerCard = testCase.lastOpenAttackerCard || null;

    // lastCloseDefenderCard: TypeCard | null;
    room.lastCloseDefenderCard = testCase.lastCloseDefenderCard || null;

    Logger.debug(`Test case "${this.testCase.testName}" END`);
  }

  createCard(dto: TypeCard) {
    const suit = this.testCase
      ? this.testCase.trumpCard.suit
      : TypeCardSuit.Clubs;

    return Card.create(dto, suit);
  }
}
