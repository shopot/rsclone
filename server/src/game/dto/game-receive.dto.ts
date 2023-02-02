import { CardDto } from '../../shared/libs/CardDto';

export class GameReceiveDto {
  readonly roomId: string;
  readonly playerId: string;
  readonly chatMessage: string;
  readonly card: CardDto;
}
