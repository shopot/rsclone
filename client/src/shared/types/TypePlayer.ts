import { TypeCard } from './TypeCard';
import { TypePlayerRole } from './TypePlayerRole';
import { TypePlayerStatus } from './TypePlayerStatus';

export type TypePlayer = {
  socketId: string;
  playerName: string;
  playerRole: TypePlayerRole;
  playerStatus: TypePlayerStatus;
  cards: TypeCard[];
};
