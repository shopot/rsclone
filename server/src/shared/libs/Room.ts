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

  public getRoomId() {
    return this.roomId;
  }

  public getPlayersCount() {
    return this.players.totalCount();
  }

  public getPlayers() {
    return this.players;
  }

  public getRoomStatus() {
    return this.roomStatus;
  }

  public getHostPlayer() {
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

    // Start new deck
    this.deck = new Deck(this.players.totalCount());

    this.dealtCards();

    this.roundNumber = 1;

    // Set attacker as player with lowest trump
    this.attacker = this.findPlayerWithLowestTrump();
    this.activePlayer = this.attacker;

    const nextPlayer = this.players.next(this.attacker);

    if (nextPlayer === null) {
      throw new Error('Player not found. Something went wrong.');
    }

    this.defender = nextPlayer;

    // Game is started
    this.roomStatus = TypeRoomStatus.GameInProgress;

    this.round = new Round(this.deck);

    this.passCounterMaxValue = this.players.totalCount() - 1;

    // Save start time
    this.gameTimeStart = Date.now();

    // Start the game
    this.gameService.setFromServerGameIsStart(this.createPayload({}));

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
   * Give one card from defender
   */
  public setDefenderClose(cardDto: CardDto) {
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

      this.startNextRound();
    }
  }

  public defenderPickUpCards() {
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

    // Go to next attacker
  }

  /**
   * Event gameAttackerPass
   */
  public attackerPass() {
    this.passCounter += 1;

    if (this.passCounter === this.passCounterMaxValue) {
      this.startNextRound();
    } else {
      this.startNextRoundStep();
    }
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

  private setNextPlayer() {
    if (this.activePlayer.getPlayerStatus() === TypePlayerStatus.InGame) {
    }
  }

  private setPlayerAsLoser(player: Player): void {
    player.setPlayerStatus(TypePlayerStatus.YouLoser);

    this.gameService.setFromServerSendPlayerStatus(
      this.createPayload({
        socketId: player.getSocketId(),
        playerId: player.getPlayerId(),
        playerStatus: TypePlayerStatus.YouLoser,
      }),
    );
  }

  /**
   * Set active player as winner
   */
  private setPlayerAsWinner(player: Player): void {
    player.setPlayerStatus(TypePlayerStatus.YouWinner);

    this.gameService.setFromServerSendPlayerStatus(
      this.createPayload({
        socketId: player.getSocketId(),
        playerId: player.getPlayerId(),
        playerStatus: TypePlayerStatus.YouWinner,
      }),
    );
  }

  /**
   *  Each player is dealt six cards
   */
  private dealtCards() {
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

  private startNextRound() {
    // dealt cards to user
    this.dealtCards();

    this.log(`Room #${this.roomId} - Start next round`);
  }

  private startNextRoundStep(): void {
    if (this.isGameOver()) {
      // Game is over nothing to do
      return;
    }

    // Если двое переход хода старт нового раунда
    if (this.players.totalCountInGame() === 2) {
      const oldAttacker = this.attacker;
      this.attacker = this.defender;
      this.defender = oldAttacker;

      return this.startNextRound();
    }

    this.log(`Room #${this.roomId} - Start next round step`);
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

      this.gameService.setFromServerGameWaitingForStart(this.createPayload({}));
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
      this.roomStatus = TypeRoomStatus.GameIsOver;

      leavePlayer.setPlayerStatus(TypePlayerStatus.YouLoser);

      for (const player of this.players) {
        if (player !== leavePlayer) {
          this.setPlayerAsWinner(player);
        }
      }

      this.setGameIsOver();
    }

    return;
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
   * Set game over
   */
  private setGameIsOver(): void {
    this.roomStatus = TypeRoomStatus.GameIsOver;

    this.gameService.setFromServerGameIsOver(this.createPayload({}));
  }

  /**
   * Returns true if a player in game
   * @param {Player} player
   * @returns
   */
  private isPlayerInGame(player: Player) {
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
  createPayload(data: Partial<TypeServerResponse>): TypeServerResponse {
    return {
      ...data,
      roomId: this.roomId,
      roomStatus: this.roomStatus,
    };
  }

  private log(message: string) {
    this.logger.log(message);
  }
}
