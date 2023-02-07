import { CardDto } from '../dto/card.dto';
import { TypePlayerRole } from './TypePlayerRole';
import { TypePlayerStatus } from './TypePlayerStatus';

export type TypePlayerDto = {
  socketId: string;
  playerName: string;
  playerRole: TypePlayerRole;
  playerStatus: TypePlayerStatus;
  cards: CardDto[];
};
