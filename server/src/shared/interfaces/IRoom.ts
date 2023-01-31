import { Card } from '../libs/Card';
import { Deck } from '../libs/Deck';
import { Player } from '../libs/Player';
import { Players } from '../libs/Players';
import { TypeRoomStatus } from '../types/TypeRoomStatus';

export interface IRoom {
  name: string;
  host: Player;
  players: Players;
  status: TypeRoomStatus;
  size: number;
  deck: Deck;
  round: number;
  trump: Card | null;
  attacker: Player | null;
  defender: Player | null;
  lastLoser: Player | null;

  addPlayer: (player: Player) => void;
  start: () => void;
}
