import { TypePlayerStatus } from '../types';
import { Player } from './Player';

export class Players {
  private players: Player[];

  constructor(players: Player[] = []) {
    this.players = players;
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

  getById(playerId: string): Player | undefined {
    const player = this.players.find((player) => {
      return player.getPlayerId() === playerId;
    });

    return player;
  }

  prev(player: Player): Player {
    const playersInGame = this.getPlayersInGame();

    const idx = playersInGame.findIndex((plr) => {
      plr.getPlayerId() === player.getPlayerId();
    });

    idx === 0
      ? playersInGame[playersInGame.length - 1]
      : playersInGame[idx - 1];

    return playersInGame[idx];
  }

  next(player: Player): Player {
    const playersInGame = this.getPlayersInGame();

    const idx = playersInGame.findIndex((plr) => {
      plr.getPlayerId() === player.getPlayerId();
    });

    return playersInGame[(idx + 1) % playersInGame.length];
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
}
