import { Deck } from './Deck';
import { Player } from './Player';
import {
  STARTING_CARDS_NUMBER,
  MIN_NUMBER_OF_PLAYERS,
  MAX_NUMBER_OF_PLAYERS,
} from '../constants';
import { Logger } from '@nestjs/common';
import { Round } from './Round';
import { TypeRoomStatus } from '../types/TypeRoomStatus';
import { CardDto } from '../dto';
import { TypePlayerStatus } from '../types';
import { Players } from './Players';
import { IGameService } from '../interfaces';
import { TypeCardRank } from '../types/TypeCardRank';

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

  /**
   * Start game room
   *
   * @returns
   */
  public start(): void {
    if (this.roomStatus !== TypeRoomStatus.WaitingForStart) {
      return;
    }

    // Start new deck
    this.deck = new Deck(this.players.totalCount());

    this.dealtCards();

    this.roundNumber = 1;

    // Set attacker as player with lowest trump
    this.attacker = this.findPlayerWithLowestTrump();
    this.activePlayer = this.attacker;

    this.defender = this.players.next(this.attacker);

    // Game is started
    this.roomStatus = TypeRoomStatus.GameInProgress;

    this.round = new Round(this.deck);

    this.passCounterMaxValue = this.players.totalCount() - 1;

    // Save start time
    this.gameTimeStart = Date.now();

    // Start the game
    this.gameService.setFromServerGameStart({
      roomId: this.roomId,
    });

    // Send status open for attacker
    // На фронте делается логика для gameAttackerSetActive
    this.gameService.setFromServerAttackerSetActive({
      playerId: this.attacker.getPlayerId(),
    });
  }

  /**
   * Give one card from attacker
   */
  public setAttackerOpen(cardDto: CardDto): void {
    if (!this.validateActivePlayer(this.attacker)) {
      throw new Error('Players is invalid. Something went wrong.');
    }

    const playerId = this.activePlayer.getPlayerId();

    const payload = {
      playerId,
      card: cardDto,
    };

    // Add the card & check it
    if (!this.round.attack(cardDto)) {
      // Something went wrong, motherfucker
      this.gameService.setFromServerAttackerOpenFail(payload);

      return;
    }

    // Remove card from player cards array
    this.activePlayer.lostCard(cardDto);

    // Reset pass counter
    this.passCounter = 0;

    // Card added successfully, send message to client
    this.gameService.setFromServerAttackerOpenSuccess(payload);

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

    this.gameService.setFromServerDefenderSetActive({
      playerId: this.activePlayer.getPlayerId(),
    });
  }

  /**
   * Give one card from defender
   */
  public setDefenderClose(cardDto: CardDto) {
    if (!this.validateActivePlayer(this.defender)) {
      throw new Error('Players is invalid. Something went wrong.');
    }

    const playerId = this.activePlayer.getPlayerId();

    const payload = {
      playerId,
      card: cardDto,
    };

    // Add the card
    if (!this.round.defend(cardDto)) {
      // Something went wrong, motherfucker
      this.gameService.setFromServerDefenderCloseFail(payload);

      return;
    }

    // Remove card from player cards array
    this.activePlayer.lostCard(cardDto);

    // Card added successfully, send message to client
    this.gameService.setFromServerDefenderCloseSuccess(payload);

    // Check game is finish for defender
    if (this.isActivePlayerWin()) {
      this.setPlayerAsWinner(this.activePlayer);

      this.startNextRound();
    }
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

  private setPlayerAsLoser(player: Player): void {
    player.setPlayerStatus(TypePlayerStatus.YouLoser);

    this.gameService.setFromServerSendPlayerStatus({
      playerId: player.getPlayerId(),
      playerStatus: TypePlayerStatus.YouLoser,
    });
  }

  /**
   * Set active player as winner
   */
  private setPlayerAsWinner(player: Player): void {
    player.setPlayerStatus(TypePlayerStatus.YouWinner);

    this.gameService.setFromServerSendPlayerStatus({
      playerId: player.getPlayerId(),
      playerStatus: TypePlayerStatus.YouWinner,
    });
  }

  /**
   *  Each player is dealt six cards
   */
  private dealtCards() {
    if (this.deck.isEmpty()) {
      return;
    }

    this.players.getPlayersInGame().forEach((player) => {
      const balance = player.getCards().length;

      if (balance < STARTING_CARDS_NUMBER) {
        player.addCards(
          this.deck.getCardsFromDeck(STARTING_CARDS_NUMBER - balance),
        );
      }
    });
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
    if (this.players.totalCount() === MAX_NUMBER_OF_PLAYERS) {
      return;
    }

    this.players.add(player);

    if (
      this.roomStatus === TypeRoomStatus.WaitingForPlayers &&
      this.players.totalCount() >= MIN_NUMBER_OF_PLAYERS
    ) {
      this.roomStatus = TypeRoomStatus.WaitingForStart;
    }
  }

  public leaveRoom(playerId: string): void {
    const leavePlayer = this.players.getById(playerId);

    if (!leavePlayer) {
      return;
    }

    if (!this.isGameOver()) {
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

    this.gameService.setFromServerGameOver({
      roomId: this.roomId,
    });
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

  private log(message: string) {
    this.logger.log(message);
  }
}
