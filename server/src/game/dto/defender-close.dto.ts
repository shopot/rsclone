import { CardDto } from 'src/shared/libs/CardDto';

export class DefenderCloseDto {
  readonly roomId: string;
  readonly playerId: string;
  readonly card: CardDto;
}
