import { Deck } from './Deck';
import { Player } from './Player';
import {
  STARTING_CARDS_NUMBER,
  MIN_NUMBER_OF_PLAYERS,
  MAX_NUMBER_OF_PLAYERS,
} from '../constants';
import { Logger } from '@nestjs/common';
import { Round } from './Round';
import {
  TypePlayerStatus,
  TypeRoomStatus,
  TypeCardRank,
  TypePlayerRole,
  TypePlacedCard,
  TypeCardSuit,
  TypeDealt,
  TypeRoomState,
  TypeCard,
} from '../types';
import { Players } from './Players';
import { GameService } from '../../game/game.service';

/**
 * Class Room
 */
export class Room {
  /** Is a unique string value */
  roomId: string;
  /** Is a object GameService */
  gameService: GameService;
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
  currentRound: number;
  /** Who attack */
  attacker: Player;
  /** Who defense */
  defender: Player;
  /** Who last defense */
  lastDefender: Player;
  /** Active player on the current step */
  activePlayer: Player;
  /** Total number of pass */
  passCounter: number;
  /** Maximum number of pass */
  passCounterMaxValue: number;
  /** Time of start game */
  gameTimeStart: number;

  isDealtEnabled: boolean;

  dealt: TypeDealt[];

  errorMessage: string;

  logger: Logger;

  constructor(roomId: string, hostPlayer: Player, gameService: GameService) {
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
    this.currentRound = 0;
    this.attacker = this.hostPlayer;
    this.defender = this.hostPlayer;
    this.lastDefender = this.hostPlayer;
    this.activePlayer = this.hostPlayer;
    this.passCounter = 0;
    this.passCounterMaxValue = 1;
    this.dealt = [];
    this.isDealtEnabled = false;
    this.errorMessage = '';
    // Only for debug!
    this.logger = new Logger(`Room #${roomId}`);
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public getDeck(): Deck {
    return this.deck;
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

  /**
   * Start game room
   *
   * @returns
   */
  public start(): boolean {
    if (
      this.roomStatus !== TypeRoomStatus.WaitingForStart ||
      this.players.totalCount() < 2
    ) {
      return false;
    }

    // Game is started
    this.roomStatus = TypeRoomStatus.GameInProgress;

    // Start new deck
    this.deck = new Deck();

    this.dealtCards();

    this.currentRound = 1;

    // Set attacker as player with lowest trump
    this.activePlayer = this.findPlayerWithLowestTrump();

    this.attacker = this.activePlayer;
    this.attacker.setPlayerRole(TypePlayerRole.Attacker);

    // this.defender = this.getNextPlayer();
    this.defender = this.getNextPlayer2(this.attacker);
    this.defender.setPlayerRole(TypePlayerRole.Defender);

    this.round = new Round(this.deck);

    this.passCounterMaxValue = this.players.totalCount() - 1;

    // Save start time
    this.gameTimeStart = Date.now();

    // Save first player socketId in this round
    this.round.setStartPlayerSocketId(this.activePlayer.getSocketId());

    // Send game status for all players
    return true;
  }

  /**
   * Give one card from attacker
   */
  public setAttackerOpen(card: TypeCard): boolean {
    this.isDealtEnabled = false;

    const isAttackSuccess = this.round.attack(card);

    // Автоматический останов игры если у защищающегося одна карта, но эта карта не может побить атакующую карту
    if (!isAttackSuccess && this.players.totalCountInGame() === 1) {
      this.activePlayer.setPlayerStatus(TypePlayerStatus.YouLoser);
      this.roomStatus = TypeRoomStatus.GameIsOver;
      return false;
    }

    if (!isAttackSuccess) {
      // Add the card & check it
      return false;
    }

    // Remove card from player cards array
    this.activePlayer.lostCard(card);

    // Reset pass counter
    this.passCounter = 0;

    // Check game is finish for attacker
    if (this.isActivePlayerWin()) {
      this.setPlayerAsWinner(this.activePlayer);

      // Check game is finish for defender
      if (
        this.players.totalCountInGame() === 1 &&
        this.defender.getCardsCount() > 1
      ) {
        this.defender.setPlayerStatus(TypePlayerStatus.YouLoser);
        this.roomStatus = TypeRoomStatus.GameIsOver;
        return true;
      }

      this.attacker = this.getNextAttacker2(this.activePlayer);
      this.attacker.setPlayerRole(TypePlayerRole.Attacker);
    }

    // Move turn to defender from attacker
    this.setActivePlayer(this.defender);

    return true;
  }

  /**
   * Give one card from defender
   */
  public setDefenderClose(card: TypeCard): boolean {
    this.lastDefender = this.activePlayer;

    // Add the card
    if (!this.round.defend(card)) {
      return false;
    }

    // Remove card from player cards array
    this.activePlayer.lostCard(card);

    if (this.isActivePlayerWin()) {
      this.setPlayerAsWinner(this.activePlayer);

      // Check attacker as YouLoser
      if (
        this.attacker.getCardsCount() > 0 &&
        this.players.totalCountInGame() === 1
      ) {
        this.attacker.setPlayerStatus(TypePlayerStatus.YouLoser);
        this.roomStatus = TypeRoomStatus.GameIsOver;
        return true;
      }

      // Check attacker as YOU_WINNER
      if (
        this.attacker.getCardsCount() === 0 &&
        this.players.totalCountInGame() === 1
      ) {
        this.attacker.setPlayerStatus(TypePlayerStatus.YouWinner);
        this.roomStatus = TypeRoomStatus.GameIsOver;
        return true;
      }

      // this.setActivePlayer(this.getNextPlayer());
      this.activePlayer = this.getNextPlayer2(this.activePlayer);
      this.startNextRound();
      return true;
    }

    // Check exits cards from defender and players in game
    if (
      this.defender.getCardsCount() > 0 &&
      this.players.totalCountInGame() === 1
    ) {
      this.defender.setPlayerStatus(TypePlayerStatus.YouLoser);
      this.roomStatus = TypeRoomStatus.GameIsOver;
      return true;
    }

    // Move turn back to attacker
    this.setActivePlayer(this.attacker);

    if (this.round.isFinished()) {
      this.setActivePlayer(this.defender);

      this.startNextRound();
    }

    return true;
  }

  /**
   * Event GameAttackerPass
   */
  public setAttackerPass(): boolean {
    // For twi players
    if (this.isTwoPlayersInGame()) {
      this.activePlayer = this.defender;
      this.startNextRound();
      return true;
    }

    this.passCounter += 1;

    if (this.passCounter === this.passCounterMaxValue) {
      // Defender becomes attacker
      this.setActivePlayer(this.defender);

      this.startNextRound();

      return true;
    }

    this.activePlayer.setPlayerRole(TypePlayerRole.Waiting);

    this.attacker = this.getNextAttacker2(this.activePlayer);
    this.attacker.setPlayerRole(TypePlayerRole.Attacker);
    this.activePlayer = this.attacker;

    if (this.attacker === this.defender) {
      this.startNextRound();
    }

    return true;
  }

  /**
   * Defender as the active player get all cards
   * Start next round with next player
   */
  public setDefenderPickUpCards(): void {
    this.activePlayer.addCards(this.round.getRoundCards());

    // Check defender as YouLoser
    if (this.players.totalCountInGame() === 1) {
      this.activePlayer.setPlayerStatus(TypePlayerStatus.YouLoser);
      this.roomStatus = TypeRoomStatus.GameIsOver;
      return;
    }

    // Next after active player (defender)
    // this.setActivePlayer(this.getNextPlayer());
    this.activePlayer = this.getNextPlayer2(this.activePlayer);

    this.startNextRound();
  }

  private startNextRound(): void {
    this.currentRound += 1;

    // Reset all roles for players in game
    this.players.getPlayersInGame().forEach((player) => {
      player.setPlayerRole(TypePlayerRole.Waiting);
    });

    // Set only from active player every time
    this.attacker = this.activePlayer;
    this.attacker.setPlayerRole(TypePlayerRole.Attacker);

    // this.defender = this.getNextPlayer(); // Can returns error!
    this.defender = this.getNextPlayer2(this.attacker);

    if (this.defender === this.attacker) {
      this.log(`Room #${this.roomId} - Can't set next defender`);

      this.roomStatus = TypeRoomStatus.GameIsOver;

      return;
    }

    this.defender.setPlayerRole(TypePlayerRole.Defender);

    // Dealt cards to user
    this.dealtCards();

    // Save first player socketId in this round,
    // after dealt only
    this.round.setStartPlayerSocketId(this.activePlayer.getSocketId());

    // Restart round
    this.round.restart();

    this.isDealtEnabled = true;

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
   * Set player as winner and send event message
   */
  private setPlayerAsWinner(player: Player): void {
    player.setPlayerStatus(TypePlayerStatus.YouWinner);
    player.setPlayerRole(TypePlayerRole.Waiting);
    this.passCounterMaxValue -= 1;
  }

  private isTwoPlayersInGame(): boolean {
    return this.players.totalCountInGame() === 2;
  }

  private getPlayersForDealt(): Player[] {
    if (!this.round) {
      return this.players.getPlayersInGame();
    }

    const playersAll = this.players.getAll();

    const startIndex = this.players.getPlayerIndexBySocketId(
      this.round.getStartPlayerSocketId(),
    );

    const players = [
      ...playersAll.slice(startIndex),
      ...playersAll.slice(0, startIndex),
    ].filter(
      (player) =>
        player.getPlayerStatus() === TypePlayerStatus.InGame &&
        player !== this.lastDefender,
    );

    if (this.lastDefender.getPlayerStatus() === TypePlayerStatus.InGame) {
      players.push(this.lastDefender);
    }

    // let players = [
    //   ...playersAll.slice(startIndex),
    //   ...playersAll.slice(0, startIndex),
    // ].filter((player) => player.getPlayerStatus() === TypePlayerStatus.InGame);

    // if (this.lastDefender === this.activePlayer) {
    //   players = players.filter(
    //     (player) => player.getSocketId() !== this.activePlayer.getSocketId(),
    //   );

    //   players.push(this.activePlayer);
    // }

    return players;
  }

  /**
   *  Each player is dealt six cards
   */
  private dealtCards(): void {
    if (this.deck.isEmpty()) {
      return;
    }

    this.dealt = [];

    this.getPlayersForDealt().forEach((player) => {
      const balance = player.getCards().length;

      const playerDealt: TypeDealt = {
        socketId: player.getSocketId(),
        cards: [],
        count: 0,
      };

      if (balance < STARTING_CARDS_NUMBER) {
        const cards = this.deck.getCardsFromDeck(
          STARTING_CARDS_NUMBER - balance,
        );

        playerDealt.cards = cards.map((card) => card.getCardDto());
        playerDealt.count = cards.length;

        player.addCards(cards);
      }

      this.dealt.push(playerDealt);
    });
  }

  /**
   * Add new player to the room
   * @param {Player} player
   * @returns {void}
   */
  public joinRoom(player: Player): boolean {
    if (
      ![
        TypeRoomStatus.WaitingForPlayers,
        TypeRoomStatus.WaitingForStart,
      ].includes(this.getRoomStatus())
    ) {
      return false;
    }

    if (this.players.totalCount() === MAX_NUMBER_OF_PLAYERS) {
      return false;
    }

    this.players.add(player);

    if (
      this.roomStatus === TypeRoomStatus.WaitingForPlayers &&
      this.players.totalCount() >= MIN_NUMBER_OF_PLAYERS
    ) {
      this.roomStatus = TypeRoomStatus.WaitingForStart;
    }

    return true;
  }

  /**
   * Leave player from room, submit event
   * @param {string} socketId
   * @returns
   */
  public leaveRoom(socketId: string): boolean {
    const leavePlayer = this.players.getPlayerBySocketId(socketId);

    if (!leavePlayer) {
      return true;
    }

    // Game over
    if (this.isGameInProgress()) {
      leavePlayer.setPlayerStatus(TypePlayerStatus.YouLoser);

      // Set all players as winner
      for (const player of this.players) {
        if (player.getPlayerStatus() !== TypePlayerStatus.YouLoser) {
          this.setPlayerAsWinner(player);
        }
      }

      this.roomStatus = TypeRoomStatus.GameIsOver;
    }

    this.players.remove(leavePlayer);

    return true;
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

  getNextAttacker2(currentAttacker: Player): Player {
    if (this.players.totalCountInGame() < 2) {
      Logger.error(`Room::getNextAttacker(): playersInGame < 2`);
      return currentAttacker;
    }

    // Check when has two players
    const playersInGame = this.players.getPlayersInGame();

    // When has two players
    if (playersInGame.length === 2) {
      return playersInGame[0].getPlayerRole() === TypePlayerRole.Defender
        ? playersInGame[1]
        : playersInGame[0];
    }

    const startIndex = this.players.getPlayerIndexBySocketId(
      currentAttacker.getSocketId(),
    );

    const playersAll = this.players.getAll();

    const players = [
      ...playersAll.slice(startIndex + 1),
      ...playersAll.slice(0, startIndex),
    ].filter(
      (player) =>
        player.getPlayerStatus() === TypePlayerStatus.InGame &&
        player.getPlayerRole() !== TypePlayerRole.Defender,
    );

    if (players.length < 1) {
      throw new Error('Room::getNextAttacker(): Returns player not found');
    }

    return players[0];
  }

  private getNextAttacker(currentAttacker: Player): Player {
    if (this.players.totalCountInGame() < 2) {
      Logger.error(`Room::getNextAttacker(): playersInGame < 2`);
      return currentAttacker;
    }

    // Check when has two players
    const playersInGame = this.players.getPlayersInGame();

    // When has two players
    if (playersInGame.length === 2) {
      return currentAttacker === playersInGame[0]
        ? playersInGame[1]
        : playersInGame[0];
    }

    // Check next player
    const players = this.players.getAll();

    const currentAttackerIndex = players.findIndex((player) => {
      return player.getSocketId() === currentAttacker.getSocketId();
    });

    if (currentAttackerIndex === -1) {
      Logger.error(
        `Room::getNextAttacker(): Player not found: currentAttackerIndex = -1`,
      );

      return currentAttacker;
    }

    let foundPlayer = null;

    const endIndex = players.length;

    let counter = 0; // Max value is equal endIndex

    for (let i = currentAttackerIndex; counter < endIndex; counter += 1) {
      i = i < endIndex - 1 ? i + 1 : 0;

      if (
        players[i].getPlayerStatus() === TypePlayerStatus.InGame &&
        players[i].getPlayerRole() === TypePlayerRole.Waiting &&
        i !== currentAttackerIndex
      ) {
        foundPlayer = players[i];
        break;
      }
    }

    if (foundPlayer) {
      return foundPlayer;
    }

    Logger.error('Room::getNextAttacker(): Returns player not found');

    return currentAttacker;
  }

  getNextPlayer2(current: Player): Player {
    const index = this.players.getPlayerIndexBySocketId(current.getSocketId());

    const playersAll = this.players.getAll();

    const players = [
      ...playersAll.slice(index + 1),
      ...playersAll.slice(0, index),
    ].filter((player) => player.getPlayerStatus() === TypePlayerStatus.InGame);

    return players[0];
  }

  /**
   * Returns next player? if not found returns error
   * @returns {Player} Next player after current active player
   */
  private getNextPlayer(): Player {
    const nextPlayer = this.players.next(this.activePlayer);

    if (nextPlayer === null) {
      Logger.error('Player not found. Something went wrong.');

      return this.activePlayer;
    }

    return nextPlayer;
  }

  /**
   * Check game in progress
   */
  private isGameInProgress(): boolean {
    return this.roomStatus === TypeRoomStatus.GameInProgress;
  }

  /**
   * Check player is finish this game   *
   */
  private isActivePlayerWin(): boolean {
    return this.activePlayer.getCardsCount() === 0 && this.deck.isEmpty();
  }

  /**
   * Returns placed cards
   * @returns {Array<TypePlacedCard>}
   */
  public getPlacedCards(): TypePlacedCard[] {
    if (this.round instanceof Round) {
      return this.round.getRoundCardsAsPlaced();
    }

    return [];
  }

  /**
   * Returns room state
   * @returns {TypeRoomState}  - Room state
   */
  public getState(): TypeRoomState {
    return {
      roomId: this.roomId,
      roomStatus: this.roomStatus || TypeRoomStatus.WaitingForPlayers,
      hostSocketId: this.hostPlayer.getSocketId(),
      activeSocketId: this.activePlayer.getSocketId(),
      players: this.players.getPlayersAsDto(),
      trumpCard: this.getDeck().getTrumpCard().getCardDto() || {
        rank: TypeCardRank.RANK_6,
        suit: TypeCardSuit.Clubs,
      },
      placedCards: this.getPlacedCards() || [],
      dealt: this.dealt,
      isDealtEnabled: this.isDealtEnabled,
      deckCounter: this.deck.getSize(),
      currentRound: this.currentRound,
    };
  }

  private getErrorMessage(): string {
    const message = this.errorMessage;

    this.errorMessage = '';

    return message;
  }

  private log(message: string): void {
    this.logger.log(message);
  }
}
