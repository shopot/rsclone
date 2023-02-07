import { TypeCardDto } from './TypeCardDto';
import { TypeRoomStatus } from './TypeRoomStatus';
import { CardDto } from '../dto';
import { TypeGameError } from './TypeGameError';
import { TypePlayerDto } from './TypePlayerDto';
import { TypeDealt } from './TypeDealt';

export type TypeServerResponse = {
  roomId?: string;
  roomStatus?: TypeRoomStatus;
  hostSocketId?: string; // socketId
  activeSocketId?: string | '';
  players?: TypePlayerDto[];
  trumpCard?: CardDto;
  placedCards?: TypeCardDto[];
  dealt?: TypeDealt[];
  deckCounter?: number;
  error?: TypeGameError | '';
};
