import { TypeCard } from './../../shared/types';

export class GameReceiveDto {
  readonly roomId: string;
  readonly playerName: string;
  readonly playerAvatar: string;
  readonly message: string; // chat message
  readonly card: TypeCard;
  readonly testName?: string;
}
