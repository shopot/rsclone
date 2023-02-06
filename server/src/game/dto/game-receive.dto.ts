import { CardDto } from '../../shared/dto';

export class GameReceiveDto {
  readonly roomId: string;
  readonly playerName: string;
  readonly chatMessage: string;
  readonly card: CardDto;
}
