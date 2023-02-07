import { CardDto } from '../dto/card.dto';

export type TypePlayerDto = {
  socketId: string;
  playerName: string;
  playerRole: TypePlayerRole;
  playerStatus: TypePlayerStatus;
  cards: CardDto[];
};

export enum TypePlayerMember {
  Host = 'Host',
  Regular = 'regular',
}

/**
 * Unknown - Disconnect from server, leave from room, etc.
 */
export enum TypePlayerRole {
  Attacker = 'Attacker',
  Defender = 'Defender',
  Waiting = 'Waiting',
  Unknown = 'Unknown',
}

export enum TypePlayerStatus {
  InGame = 'IN_GAME',
  YouWinner = 'YOU_WINNER',
  YouLoser = 'YOU_LOSER',
}
