import { TypeCard } from './../../shared/types';

export class GameReceiveDto {
  readonly roomId: string;
  readonly playerName: string;
  readonly message: string; // chat message
  readonly card: TypeCard;
}
