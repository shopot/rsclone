import { TypeRoomStatus } from './TypeRoomStatus';
import { CardDto } from '../dto';
import { TypePlayerStatus } from './TypePlayerStatus';

export type TypeGameResponse = {
  roomId?: string;
  playerId?: string;
  card?: CardDto;
  playerStatus?: TypePlayerStatus;
  roomStatus?: TypeRoomStatus;
};
