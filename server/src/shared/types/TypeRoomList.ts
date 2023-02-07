import { TypeRoomStatus } from './TypeRoomStatus';

export type TypeRoomDto = {
  roomId: string;
  playersCount: number;
  status: TypeRoomStatus;
};

export type TypeRoomList = TypeRoomDto[];
