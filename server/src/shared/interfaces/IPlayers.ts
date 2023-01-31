import { Player } from '../libs/Player';

export interface IPlayers {
  players: Player[];
  size: number;

  add: (player: Player) => void;
  getIndex: (player: Player) => number;
  prev: (curPlayer: Player) => Player | null;
  next: (curPlayer: Player) => Player | null;
}
