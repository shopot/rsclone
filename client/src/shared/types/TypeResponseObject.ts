import { TypeCard } from './TypeCard';
import { TypePlacedCard } from './TypePlacedCard';
import { TypePlayerRole } from './TypePlayerRole';
import { TypePlayerStatus } from './TypePlayerStatus';
import { TypeRoomStatus } from './TypeRoomStatus';
import { TypeServerError } from './TypeServerError';

export type TypeRoomDto = {
  roomId: string;
  playersCount: number;
  status: TypeRoomStatus;
};

export type TypeResponseRoomList = TypeRoomDto[];

export type TypeDealt = {
  socketId: string;
  cards: TypeCard[];
  count: number;
};

export type TypePlayerDto = {
  socketId: string;
  playerName: string;
  playerRole: TypePlayerRole;
  playerStatus: TypePlayerStatus;
  cards: TypeCard[];
};

export type TypeResponseRoomData = {
  roomId: string;
  roomStatus: TypeRoomStatus;
  hostSocketId: string;
  activePlayerId: string;
  players: TypePlayerDto[];
  trumpCard?: TypeCard;
  placedCards: TypePlacedCard[];
  dealt: TypeDealt[];
  deckCounter: number;
  error: TypeServerError | '';
};

export type TypeResponseObject = { data: TypeResponseRoomData };
