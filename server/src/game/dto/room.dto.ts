import { TypeRoomStatus } from 'src/shared/types/TypeRoomStatus';

export class RoomDto {
  readonly roomId: string;
  readonly playersNumber: number;
  readonly status: TypeRoomStatus;
}
