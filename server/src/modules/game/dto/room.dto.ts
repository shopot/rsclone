import { TypeRoomStatus } from '../../../shared/types';

export class RoomDto {
  readonly roomId: string;
  readonly playersCount: number;
  readonly status: TypeRoomStatus;
}
