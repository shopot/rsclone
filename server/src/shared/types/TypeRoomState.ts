import { TypeCard } from './TypeCard';
import { TypeDealt } from './TypeDealt';
import { TypePlacedCard } from './TypePlacedCard';
import { TypePlayerDto } from './TypePlayerDto';
import { TypeGameAction } from './TypeGameAction';

export type TypeRoomState = {
  roomId: string;
  roomStatus: TypeRoomStatus;
  hostSocketId: string;
  activeSocketId: string;
  players: TypePlayerDto[];
  trumpCard: TypeCard;
  placedCards: TypePlacedCard[];
  dealt: TypeDealt[];
  isDealtEnabled: boolean;
  deckCounter: number;
  currentRound: number;
  lastGameAction: TypeGameAction;
  beatCardsArray: Array<TypeCard[]>;
  beatCardsPlacedArray: Array<TypePlacedCard[]>;
  lastOpenAttackerCard: TypeCard | null;
  lastCloseDefenderCard: TypeCard | null;
};

export enum TypeRoomStatus {
  WaitingForPlayers = 'WaitingForPlayers',
  WaitingForStart = 'WaitingForStart',
  GameInProgress = 'GameInProgress',
  GameIsOver = 'GameIsOver',
}

export type TypeRoomDto = {
  roomId: string;
  playersCount: number;
  status: TypeRoomStatus;
};

export type TypeGameStats = {
  roomId: string;
  players: string;
  loser: string;
  duration: number;
  rounds: number;
};

export type TypeRoomList = TypeRoomDto[];
