import { IRoom } from '../interfaces/IRoom';
import { Card } from './Card';
import { Deck } from './Deck';
import { Player } from './Player';
import { Players } from './Players';
import { TypeRoomStatus } from '../types/TypeRoomStatus';
import {
  STARTING_CARDS_NUMBER,
  MIN_ROOM_SIZE,
  MAX_ROOM_SIZE,
} from '../constants';

export class Room implements IRoom {
  name;
  host: Player;
  players: Players;
  status: TypeRoomStatus;
  deck;
  round;
  trump: Card | null;
  attacker: Player | null;
  defender: Player | null;

  constructor(name: string, host: Player) {
    this.name = name;
    this.host = host;
    this.players = new Players([host]);
    this.status = 'waitingforplayers';
    this.deck = new Deck();
    this.round = 0;
    this.trump = null;
    this.attacker = null;
    this.defender = null;
  }

  get size() {
    return this.players.size;
  }

  addPlayer(player: Player) {
    if (this.size === MAX_ROOM_SIZE) {
      return;
    }

    this.players.add(player);

    if (this.status === 'waitingforplayers' && this.size >= MIN_ROOM_SIZE) {
      this.status = 'awaitingstart';
    }
  }

  private findPlayerWithLowestTrump() {
    if (!this.trump || this.size === 0) {
      return;
    }

    let foundPlayer = null;
    let lowestTrumpCardRank = Infinity;
    for (const player of this.players) {
      for (const card of player.cards) {
        if (card.suit === this.trump.suit && card.rank < lowestTrumpCardRank) {
          lowestTrumpCardRank = card.rank;
          foundPlayer = player;
        }
      }
    }

    return foundPlayer;
  }

  start() {
    if (this.status !== 'awaitingstart') {
      return;
    }

    this.status = 'gameinprogress';
    this.deck.fill();
    this.deck.shuffle();
    for (const player of this.players) {
      player.cards.push(...this.deck.takeCards(STARTING_CARDS_NUMBER));
    }
    this.trump = this.deck.getTopCard();
    this.round = 1;
    const attackingPlayer = this.findPlayerWithLowestTrump();
    if (!attackingPlayer) {
      throw new Error(
        "Can't determine attacking player. Something went very wrong",
      );
    }
    this.attacker = attackingPlayer;
    this.defender = this.players.prev(this.attacker);
  }
}
