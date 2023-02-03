import { CardDto } from 'src/shared/dto';

export class GameReceiveDto {
  readonly roomId: string;
  readonly playerId: string;
  readonly chatMessage: string;
  readonly card: CardDto;
}
