import { TypeCard } from './TypeCard';

export type TypePlayerDto = {
  readonly socketId: string;
  readonly playerName: string;
  readonly playerRole: TypePlayerRole;
  readonly playerStatus: TypePlayerStatus;
  readonly cards: TypeCard[];
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
