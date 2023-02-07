import { TypeCard } from './TypeCard';
import { TypeGameError } from './TypeGameError';
import { TypePlayerDto } from './TypePlayerDto';
import { TypeDealt } from './TypeDealt';
import { TypePlacedCard } from './TypePlacedCard';
import { TypeRoomStatus } from './TypeRoomState';

export type TypeServerResponse = {
  roomId: string;
  roomStatus?: TypeRoomStatus;
  hostSocketId?: string; // socketId
  activeSocketId?: string | '';
  players?: TypePlayerDto[];
  trumpCard?: TypeCard;
  placedCards?: TypePlacedCard[];
  dealt?: TypeDealt[];
  isDealtEnabled?: boolean;
  deckCounter?: number;
  error?: TypeGameError | '';
};
