import { TypeCard } from './TypeCard';
import { TypeGameError } from './TypeGameError';
import { TypePlayerDto } from './TypePlayerDto';
import { TypeDealt } from './TypeDealt';
import { TypePlacedCard } from './TypePlacedCard';
import { TypeRoomStatus } from './TypeRoomState';
import { TypeGameAction } from './TypeGameAction';

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
  currentRound?: number;
  lastGameAction?: TypeGameAction;
  beatCardsArray?: Array<TypeCard[]>;
  beatCardsPlacedArray?: Array<TypePlacedCard[]>;
  lastOpenAttackerCard: TypeCard | null;
  lastCloseDefenderCard: TypeCard | null;
  error?: TypeGameError;
};
