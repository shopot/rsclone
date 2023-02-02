import { TypeRoomStatus } from 'src/shared/types/TypeRoomStatus';

export class RoomDto {
  readonly roomId: string;
  readonly playersCount: number;
  readonly status: TypeRoomStatus;
}
