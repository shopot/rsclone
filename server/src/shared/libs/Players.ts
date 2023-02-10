import { TypePlayerDto, TypePlayerStatus } from '../types';
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
    return [...this.players];
  }

  public add(player: Player): void {
    player.setPlayerStatus(TypePlayerStatus.InGame);

    this.players.push(player);
  }

  public remove(player: Player): void {
    this.players = this.players.filter((plr) => {
      return plr.getSocketId() !== player.getSocketId();
    });
  }

  public getPlayerIndexBySocketId(socketId: string): number {
    const index = this.players.findIndex((player) => {
      return player.getSocketId() === socketId;
    });

    return index;
  }

  public getPlayerBySocketId(socketId: string): Player | undefined {
    const player = this.players.find((player) => {
      return player.getSocketId() === socketId;
    });

    return player;
  }

  public getPlayersAsDto(): TypePlayerDto[] {
    return this.players.map((player) => player.getPlayerAsDto());
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
    return this.getPlayersInGame().length;
  }

  public totalCount() {
    return this.players.length;
  }
}
