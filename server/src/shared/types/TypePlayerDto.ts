import { CardDto } from '../dto/card.dto';
import { TypePlayerRole } from './TypePlayerRole';
import { TypePlayerStatus } from './TypePlayerStatus';

export type TypePlayerDto = {
  playerId: string;
  playerRole: TypePlayerRole;
  playerStatus: TypePlayerStatus;
  cards: CardDto[];
};
