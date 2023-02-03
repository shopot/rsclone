import { TypePlayerStatus } from '../types';
import { Player } from './Player';

export class Players {
  private players: Player[];

  constructor(players: Player[] = []) {
    this.players = players;
  }

  *[Symbol.iterator]() {
    for (const player of this.players) {
      yield player;
    }
  }

  public getAll() {
    return this.players;
  }

  public add(player: Player): void {
    player.setPlayerStatus(TypePlayerStatus.InGame);

    this.players.push(player);
  }

  public remove(player: Player): void {
    this.players = this.players.filter((plr) => {
      return plr.getPlayerId() !== player.getPlayerId();
    });
  }

  public getById(playerId: string): Player | undefined {
    const player = this.players.find((player) => {
      return player.getPlayerId() === playerId;
    });

    return player;
  }

  public next(fromPlayer: Player): Player | null {
    const playersInGame = this.getPlayersInGame();

    if (playersInGame.length < 2) {
      // Something went wrong.
      return null;
    }

    // When has two players
    if (playersInGame.length === 2) {
      return fromPlayer === playersInGame[0]
        ? playersInGame[1]
        : playersInGame[0];
    }

    const idx = this.players.findIndex((plr) => {
      return plr.getPlayerId() === fromPlayer.getPlayerId();
    });

    if (idx === -1) {
      // Player not found. Something went wrong.
      return null;
    }

    let foundPlayer = null;
    const endIndex = this.totalCount();
    let counter = 0; // Max value is equal endIndex

    for (let i = idx; counter < endIndex; counter += 1) {
      i = i < endIndex - 1 ? i + 1 : 0;

      if (
        this.players[i].getPlayerStatus() === TypePlayerStatus.InGame &&
        i !== idx
      ) {
        foundPlayer = this.players[i];
        break;
      }
    }

    return foundPlayer;
  }

  /**
   * Returns is active players in game
   * @returns Players array by TypePlayerStatus.InGame
   */
  public getPlayersInGame(): Player[] {
    return this.players.filter((player) => {
      return player.getPlayerStatus() === TypePlayerStatus.InGame;
    });
  }

  public totalCountInGame() {
    return this.players.length;
  }

  public totalCount() {
    return this.players.length;
  }
}
