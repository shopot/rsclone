import { TypeRoomStatus } from './TypeRoomStatus';
import { CardDto } from '../dto';
import { TypeGameError } from './TypeGameError';
import { TypePlayerDto } from './TypePlayerDto';
import { TypeDealt } from './TypeDealt';
import { TypePlacedCard } from './TypePlacedCard';

export type TypeServerResponse = {
  roomId?: string;
  roomStatus?: TypeRoomStatus;
  hostSocketId?: string; // socketId
  activeSocketId?: string | '';
  players?: TypePlayerDto[];
  trumpCard?: CardDto;
  placedCards?: TypePlacedCard[];
  dealt?: TypeDealt[];
  deckCounter?: number;
  error?: TypeGameError | '';
};
