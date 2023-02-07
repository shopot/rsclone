import { TypeCard } from './../../shared/types';

export class GameReceiveDto {
  readonly roomId: string;
  readonly playerName: string;
  readonly chatMessage: string;
  readonly card: TypeCard;
}
