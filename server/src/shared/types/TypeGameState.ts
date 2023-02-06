import { CardDto } from './../dto';
import { TypeDealt } from './TypeDealt';
import { TypePlacedCard } from './TypePlacedCard';
import { TypePlayerDto } from './TypePlayerDto';
import { TypeRoomStatus } from './TypeRoomStatus';
import { TypeGameError } from './TypeGameError';

export type TypeGameState = {
  roomId?: string;
  roomStatus?: TypeRoomStatus;
  hostPlayerId?: string; // playerId
  players?: TypePlayerDto[];
  activePlayer?: string;
  trumpCard?: CardDto;
  placedCards: TypePlacedCard[];
  dealt?: TypeDealt[];
  deckCounter?: number;
  error?: TypeGameError;
};
