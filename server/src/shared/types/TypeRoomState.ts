import { TypeCardDto } from './TypeCardDto';
import { TypeDealt } from './TypeDealt';
import { TypePlacedCard } from './TypePlacedCard';
import { TypePlayerDto } from './TypePlayerDto';

export type TypeRoomState = {
  roomId: string;
  roomStatus: TypeRoomStatus;
  hostSocketId: string;
  activeSocketId: string;
  players: TypePlayerDto[];
  trumpCard: TypeCardDto;
  placedCards: TypePlacedCard[];
  dealt: TypeDealt[];
  deckCounter: number;
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