import { TypeRoomStatus } from './TypeRoomStatus';
import { CardDto } from '../dto';
import { TypeGameError } from './TypeGameError';
import { TypePlayerDto } from './TypePlayerDto';
import { TypePlacedCard } from './TypePlacedCard';
import { TypeDealt } from './TypeDealt';

export type TypeServerResponse = {
  roomId?: string;
  roomStatus?: TypeRoomStatus;
  playerId?: string | '';
  hostPlayerId?: string; // playerId
  activePlayerId?: string | '';
  players?: TypePlayerDto[];
  trumpCard?: CardDto;
  placedCards?: TypePlacedCard[];
  dealt?: TypeDealt[];
  deckCounter?: number;
  error?: TypeGameError | '';
};
