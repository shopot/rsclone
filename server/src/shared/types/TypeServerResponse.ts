import { Socket } from 'socket.io';
import { TypeRoomStatus } from './TypeRoomStatus';
import { CardDto, DealtDto } from '../dto';
import { TypePlayerStatus } from './TypePlayerStatus';

export type TypeServerResponse = {
  roomId: string;
  socketId?: string;
  socket?: Socket;
  playerId?: string;
  card?: CardDto;
  playerStatus?: TypePlayerStatus;
  roomStatus?: TypeRoomStatus;
  dealtCards?: DealtDto[];
};
