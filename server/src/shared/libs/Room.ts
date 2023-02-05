import { Deck } from './Deck';
import { Player } from './Player';
import {
  STARTING_CARDS_NUMBER,
  MIN_NUMBER_OF_PLAYERS,
  MAX_NUMBER_OF_PLAYERS,
} from '../constants';
import { Logger } from '@nestjs/common';
import { Round } from './Round';
import { CardDto, DealtDto } from '../dto';
import {
  TypePlayerStatus,
  TypeServerResponse,
  TypeRoomStatus,
  TypeCardRank,
} from '../types';
import { Players } from './Players';
import { IGameService } from '../interfaces';

/**
 * Class Room
 */
export class Room {
  /** Is a unique string value */
  roomId: string;
  /** Is a object GameService */
  gameService: IGameService;
  /** Who create this room (game) */
  hostPlayer: Player;
  /** Players list in this room */
  players: Players;
  /** Deck of cards */
  deck: Deck;
  /** Round */
  round: Round;
  /** Room status */
  roomStatus: TypeRoomStatus;
  /** Number of rounds played in the game */
  roundNumber: number;
  /** Who attack */
  attacker: Player;
  /** Who defense */
  defender: Player;
  /** Active player on the current step */
  activePlayer: Player;
  /** Total number of pass */
  passCounter: number;
  /** Maximum number of pass */
  passCounterMaxValue: number;
  /** Time of start game */
  gameTimeStart: number;

  logger: Logger;

  constructor(roomId: string, hostPlayer: Player, gameService: IGameService) {
    this.roomId = roomId;

    // For send actions
    this.gameService = gameService;

    this.hostPlayer = hostPlayer;
    this.hostPlayer.setPlayerStatus(TypePlayerStatus.InGame);
    this.players = new Players([this.hostPlayer]);

    // Create empty deck
    this.deck = new Deck();

    // Initial data
    this.roomStatus = TypeRoomStatus.WaitingForPlayers;
    this.roundNumber = 0;
    this.attacker = this.hostPlayer;
    this.defender = this.hostPlayer;
    this.activePlayer = this.hostPlayer;
    this.passCounter = 0;
    this.passCounterMaxValue = 1;

    // Only for debug!
    this.logger = new Logger(`Room #${roomId}`);
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public getPlayersCount(): number {
    return this.players.totalCount();
  }

  public getPlayers(): Players {
    return this.players;
  }

  public getRoomStatus(): TypeRoomStatus {
    return this.roomStatus;
  }

  public getHostPlayer(): Player {
    return this.hostPlayer;
  }

  /**
   * Start game room
   *
   * @returns
   */
  public start(): void {
    if (
      this.roomStatus !== TypeRoomStatus.WaitingForStart ||
      this.players.totalCount() < 2
    ) {
      return;
    }

    // Game is started
    this.roomStatus = TypeRoomStatus.GameInProgress;

    // Start new deck
    this.deck = new Deck(this.players.totalCount());

    this.dealtCards();

    this.roundNumber = 1;

    // Set attacker as player with lowest trump
    this.attacker = this.findPlayerWithLowestTrump();

    this.activePlayer = this.attacker;

    this.defender = this.getNextPlayer();

    this.round = new Round(this.deck);

    this.passCounterMaxValue = this.players.totalCount() - 1;

    // Save start time
    this.gameTimeStart = Date.now();

    // Send game status for all players
    this.sendGameStatus();

    // Send status open for attacker
    // На фронте делается логика для gameAttackerSetActive
    this.gameService.setFromServerAttackerSetActive(
      this.createPayload({
        socketId: this.attacker.getSocketId(),
        playerId: this.attacker.getPlayerId(),
      }),
    );
  }

  /**
   * Give one card from attacker
   */
  public setAttackerOpen(cardDto: CardDto): void {
    if (!this.validateActivePlayer(this.attacker)) {
      throw new Error('Players is invalid. Something went wrong.');
    }

    const payload = {
      socketId: this.activePlayer.getSocketId(),
      playerId: this.activePlayer.getPlayerId(),
      card: cardDto,
    };

    // Add the card & check it
    if (!this.round.attack(cardDto)) {
      // Something went wrong, motherfucker
      this.gameService.setFromServerAttackerOpenFail(
        this.createPayload({ ...payload }),
      );

      return;
    }

    // Remove card from player cards array
    this.activePlayer.lostCard(cardDto);

    // Reset pass counter
    this.passCounter = 0;

    // Card added successfully, send message to client
    this.gameService.setFromServerAttackerOpenSuccess(
      this.createPayload({ ...payload }),
    );

    // Check game is finish for attacker
    if (this.isActivePlayerWin()) {
      this.setPlayerAsWinner(this.activePlayer);

      // Move turn to defender
      return this.setAttackerDone();
    }
  }

  /**
   * Move turn to defender from attacker
   * Emit event: gameFromServerDefenderSetActive
   */
  public setAttackerDone(): void {
    this.setActivePlayer(this.defender);

    this.gameService.setFromServerDefenderSetActive(
      this.createPayload({
        socketId: this.activePlayer.getSocketId(),
        playerId: this.activePlayer.getPlayerId(),
      }),
    );
  }

  /**
   * Event gameAttackerPass
   */
  public attackerPass(): void {
    this.passCounter += 1;

    if (this.passCounter === this.passCounterMaxValue) {
      // Start active player as new attacker
      this.setActivePlayer(this.defender);

      this.startNextRound();
    } else {
      this.attacker = this.getNextPlayer();

      this.setActivePlayer(this.attacker);

      this.gameService.setFromServerAttackerSetActive(this.createPayload({}));
    }
  }

  /**
   * Give one card from defender
   */
  public setDefenderClose(cardDto: CardDto): void {
    if (!this.validateActivePlayer(this.defender)) {
      throw new Error('Players is invalid. Something went wrong.');
    }

    const payload = {
      socketId: this.activePlayer.getSocketId(),
      playerId: this.activePlayer.getPlayerId(),
      card: cardDto,
    };

    // Add the card
    if (!this.round.defend(cardDto)) {
      // Something went wrong, motherfucker
      this.gameService.setFromServerDefenderCloseFail(
        this.createPayload({ ...payload }),
      );

      return;
    }

    // Remove card from player cards array
    this.activePlayer.lostCard(cardDto);

    // Card added successfully, send message to client
    this.gameService.setFromServerDefenderCloseSuccess(
      this.createPayload({ ...payload }),
    );

    // Check game is finish for defender
    if (this.isActivePlayerWin()) {
      this.setPlayerAsWinner(this.activePlayer);

      this.updateGameStatus();

      // Game is over
      if (this.isGameOver()) {
        return this.sendGameStatus();
      }

      this.setActivePlayer(this.getNextPlayer());

      this.startNextRound();
    }
  }

  public defenderPickUpCards(): void {
    if (!this.validateActivePlayer(this.defender)) {
      throw new Error('Players is invalid. Something went wrong.');
    }

    this.activePlayer.addCards(this.round.getRoundCards());

    this.gameService.setFromServerDefenderPickUpCards(
      this.createPayload({
        socketId: this.activePlayer.getSocketId(),
        playerId: this.activePlayer.getPlayerId(),
      }),
    );

    this.setActivePlayer(this.getNextPlayer());

    this.startNextRound();
  }

  private startNextRound(): void {
    // Dealt cards to user
    this.dealtCards();

    this.attacker = this.activePlayer;
    this.defender = this.getNextPlayer();

    this.gameService.setFromServerAttackerSetActive(this.createPayload({}));

    this.log(`Room #${this.roomId} - Start next round`);
  }

  /**
   * Validate and set active player
   * @param {Player} player
   */
  private setActivePlayer(player: Player): void {
    if (!this.players.getPlayersInGame().includes(player)) {
      throw new Error("Can't set active player. Something went wrong.");
    }

    this.activePlayer = player;
  }

  /**
   * Set player as loser and send event message
   */
  private setPlayerAsLoser(player: Player): void {
    player.setPlayerStatus(TypePlayerStatus.YouLoser);

    this.sendPlayerStatus(player, TypePlayerStatus.YouLoser);
  }

  /**
   * Set player as winner and send event message
   */
  private setPlayerAsWinner(player: Player): void {
    player.setPlayerStatus(TypePlayerStatus.YouWinner);

    this.sendPlayerStatus(player, TypePlayerStatus.YouWinner);
  }

  /**
   *  Each player is dealt six cards
   */
  private dealtCards(): void {
    if (this.deck.isEmpty()) {
      return;
    }

    const dealtCardsArray: DealtDto[] = [];

    this.players.getPlayersInGame().forEach((player) => {
      const balance = player.getCards().length;

      if (balance < STARTING_CARDS_NUMBER) {
        const cards = this.deck.getCardsFromDeck(
          STARTING_CARDS_NUMBER - balance,
        );

        dealtCardsArray.push(DealtDto.create(player.getPlayerId(), cards));

        player.addCards(cards);
      }
    });

    if (dealtCardsArray.length) {
      this.gameService.setFromServerDealtCardsToPlayers(
        this.createPayload({
          dealtCards: dealtCardsArray,
        }),
      );
    }
  }

  /**
   * Add new player to the room
   * @param {Player} player
   * @returns {void}
   */
  public joinRoom(player: Player): void {
    const payload = {
      socketId: player.getSocketId(),
      playerId: player.getPlayerId(),
    };

    if (this.players.totalCount() === MAX_NUMBER_OF_PLAYERS) {
      this.gameService.setFromServerJoinRoomFail(
        this.createPayload({ ...payload }),
      );

      return;
    }

    this.players.add(player);

    this.gameService.setFromServerJoinRoomSuccess(
      this.createPayload({ ...payload }),
    );

    if (
      this.roomStatus === TypeRoomStatus.WaitingForPlayers &&
      this.players.totalCount() >= MIN_NUMBER_OF_PLAYERS
    ) {
      this.roomStatus = TypeRoomStatus.WaitingForStart;

      this.sendGameStatus();
    }
  }

  /**
   * Leave player from room, submit event
   * @param {string} playerId
   * @returns
   */
  public leaveRoom(playerId: string): void {
    const leavePlayer = this.players.getById(playerId);

    if (!leavePlayer) {
      return;
    }

    this.players.remove(leavePlayer);

    this.gameService.setFromServerLeaveRoomSuccess(
      this.createPayload({
        socketId: leavePlayer.getSocketId(),
        playerId: leavePlayer.getPlayerId(),
      }),
    );

    if (
      !this.isGameInProgress() &&
      this.getPlayersCount() < MIN_NUMBER_OF_PLAYERS
    ) {
      this.roomStatus = TypeRoomStatus.WaitingForPlayers;
    }

    if (this.isGameInProgress() && this.isPlayerInGame(leavePlayer)) {
      this.setPlayerAsLoser(leavePlayer);

      this.updateGameStatus();

      // Set all players as winner
      for (const player of this.players) {
        if (player.getPlayerStatus() !== TypePlayerStatus.YouLoser) {
          this.setPlayerAsWinner(player);
        }
      }
    }

    // Update room status for all players
    return this.sendGameStatus();
  }

  /**
   * Restarts game after current game session was finished
   */
  public restartGame(): void {
    this.roomStatus = TypeRoomStatus.WaitingForStart;

    this.start();
  }

  /**
   * Sets room to 'open' state, so players from outside can possibly join
   */
  public openRoom(): void {
    if (this.players.totalCount() >= MIN_NUMBER_OF_PLAYERS) {
      this.roomStatus = TypeRoomStatus.WaitingForStart;
    } else {
      this.roomStatus = TypeRoomStatus.WaitingForPlayers;
    }

    this.sendGameStatus();
  }

  /**
   * Returns first attacker
   * @returns {Player} First attacker
   */
  private findPlayerWithLowestTrump(): Player {
    const trumpSuit = this.deck.getTrumpSuit();

    let foundPlayer = this.hostPlayer;

    let lowestTrumpCardRank = TypeCardRank.RANK_A;

    for (const player of this.players) {
      for (const card of player.cards) {
        if (card.suit === trumpSuit && card.rank < lowestTrumpCardRank) {
          lowestTrumpCardRank = card.rank;
          foundPlayer = player;
        }
      }
    }

    return foundPlayer;
  }

  /**
   * Returns next player? if not found returns error
   * @returns {Player} Next player after current active player
   */
  private getNextPlayer(): Player {
    const nextPlayer = this.players.next(this.activePlayer);

    if (nextPlayer === null) {
      throw new Error('Player not found. Something went wrong.');
    }

    return nextPlayer;
  }

  /**
   * Update game status, set game over if exists
   */
  private updateGameStatus(): void {
    for (const player of this.players) {
      if (player.getPlayerStatus() === TypePlayerStatus.YouLoser) {
        this.roomStatus = TypeRoomStatus.GameIsOver;

        break;
      }
    }

    if (this.players.totalCountInGame() <= 1) {
      this.roomStatus = TypeRoomStatus.GameIsOver;
    }
  }

  /**
   * Check game in progress
   */
  private isGameInProgress(): boolean {
    return this.roomStatus === TypeRoomStatus.GameInProgress;
  }

  /**
   * Check game is finish
   */
  private isGameOver(): boolean {
    return this.roomStatus === TypeRoomStatus.GameIsOver;
  }

  /**
   * Returns true if a player in game
   * @param {Player} player
   * @returns
   */
  private isPlayerInGame(player: Player): boolean {
    return player.getPlayerStatus() === TypePlayerStatus.InGame;
  }

  /**
   * Check player is finish this game   *
   */
  private isActivePlayerWin(): boolean {
    return this.activePlayer.getCardsCount() === 0 && this.deck.isEmpty();
  }

  /**
   * Validate active player
   * Check attacker === defender
   *
   * @param {Player} player Current active player
   * @returns {boolean}
   */
  private validateActivePlayer(player: Player): boolean {
    return this.activePlayer === player && this.attacker !== this.defender;
  }

  /**
   * Returns payload data
   * @param {Partial<TypeServerResponse>} data
   * @returns {TypeServerResponse} payload for send data to client
   */
  private createPayload(data: Partial<TypeServerResponse>): TypeServerResponse {
    return {
      ...data,
      roomId: this.roomId,
      roomStatus: this.roomStatus,
    };
  }

  private sendPlayerStatus(
    player: Player,
    playerStatus: TypePlayerStatus,
  ): void {
    this.gameService.setFromServerSendPlayerStatus(
      this.createPayload({
        socketId: player.getSocketId(),
        playerId: player.getPlayerId(),
        playerStatus,
      }),
    );
  }

  private sendGameStatus(): void {
    this.gameService.setFromServerRoomStatusChange(this.createPayload({}));
  }

  private log(message: string): void {
    this.logger.log(message);
  }
}
