import { TypeCard } from './TypeCard';
import { TypeDealt } from './TypeDealt';
import { TypePlacedCard } from './TypePlacedCard';
import { TypePlayerDto } from './TypePlayerDto';

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

export type TypeRoomList = TypeRoomDto[];
