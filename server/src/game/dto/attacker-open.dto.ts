import { CardDto } from '../../shared/libs/CardDto';

export class AttackerOpenDto {
  readonly roomId: string;
  readonly playerId: string;
  readonly card: CardDto;
}
