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
  playerId: string;
  count: number;
};

export type TypePlayerDto = {
  playerId: string;
  playerRole: TypePlayerRole;
  playerStatus: TypePlayerStatus;
  cards: TypeCard[];
};

export type TypeResponseRoomData = {
  roomId?: string;
  roomStatus?: TypeRoomStatus;
  hostPlayerId?: string; // playerId
  players?: TypePlayerDto[];
  activePlayerId?: string;
  trumpCard?: TypeCard;
  placedCards?: TypePlacedCard[];
  dealt?: TypeDealt[];
  deckCounter?: number;
  error?: TypeServerError | '';
};

export type TypeResponseObject = { data: TypeResponseRoomData } | { data: TypeResponseRoomList };
