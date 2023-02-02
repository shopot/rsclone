import { CardDto } from '../dto';
import { TypePlayerStatus } from './TypePlayerStatus';

export type TypeGameResponse = {
  playerId?: string;
  card?: CardDto;
  playerStatus?: TypePlayerStatus;
};
