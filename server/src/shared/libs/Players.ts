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
    return this.players;
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
      return plr.getSocketId() === fromPlayer.getSocketId();
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

  public getPlayersAsDto(): TypePlayerDto[] {
    return this.players.map((player) => {
      return {
        socketId: player.getSocketId(),
        playerName: player.getPlayerName(),
        playerRole: player.getPlayerRole(),
        playerStatus: player.getPlayerStatus(),
        cards: player.getCardsAsDto(),
      };
    });
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
