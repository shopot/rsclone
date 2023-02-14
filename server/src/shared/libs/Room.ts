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
  TypeChatMessage,
  TypeGameError,
  TypeGameErrorType,
  TypeGameStats,
  TypeGameAction,
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
  /** Names of of players who started the game (used for stats purposes) */
  startingPlayerNames: string[];
  /** Chat messages */
  chat: TypeChatMessage[];
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
  /** Last loser (or null if it is first game session or last loser left room) */
  lastLoser: Player | null;
  /** Total number of pass */
  passCounter: number;
  /** Maximum number of pass */
  passCounterMaxValue: number;
  /** Time of start game */
  gameTimeStart: number;
  gameStats: TypeGameStats;
  isDealtEnabled: boolean;
  beatCardsArray: Array<TypeCard[]>;
  beatCardsPlacedArray: Array<TypePlacedCard[]>;

  isDefenderPickup: boolean;

  dealt: TypeDealt[];
  LastGameAction: TypeGameAction;

  logger: Logger;

  constructor(roomId: string, hostPlayer: Player, gameService: GameService) {
    this.roomId = roomId;

    // For send actions
    this.gameService = gameService;

    this.hostPlayer = hostPlayer;
    this.hostPlayer.setPlayerStatus(TypePlayerStatus.InGame);
    this.players = new Players([this.hostPlayer]);
    this.startingPlayerNames = [];
    this.chat = [];

    // Create empty deck
    this.deck = new Deck();

    // Initial data
    this.roomStatus = TypeRoomStatus.WaitingForPlayers;
    this.currentRound = 0;
    this.attacker = this.hostPlayer;
    this.defender = this.hostPlayer;
    this.lastDefender = this.hostPlayer;
    this.activePlayer = this.hostPlayer;
    this.lastLoser = null;
    this.passCounter = 0;
    this.passCounterMaxValue = 1;
    this.dealt = [];
    this.isDealtEnabled = false;
    this.isDefenderPickup = false;
    this.gameStats = {
      roomId: this.roomId,
      players: '',
      loser: '',
      duration: 0,
      rounds: 0,
    };
    this.LastGameAction = TypeGameAction.Undefined;

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
  public start(): TypeGameError | true {
    if (this.roomStatus !== TypeRoomStatus.WaitingForStart) {
      return {
        type: TypeGameErrorType.GameStartFailed,
        message: "Room is not in 'WaitingForStart' mode",
      };
    }

    // Game is started
    this.roomStatus = TypeRoomStatus.GameInProgress;

    // Save starting player names
    this.startingPlayerNames = [];
    for (const player of this.players) {
      this.startingPlayerNames.push(player.playerName);
    }

    // Clear old chat messages
    this.chat = [];

    // Start new deck
    this.deck = new Deck();

    this.dealtCards();

    this.currentRound = 1;

    // reset player roles
    for (const player of this.players) {
      player.setPlayerRole(TypePlayerRole.Waiting);
    }

    this.activePlayer = this.lastLoser
      ? this.findPreviousPlayerToLastLoser(this.lastLoser)
      : this.findPlayerWithLowestTrump();

    this.attacker = this.activePlayer;
    this.attacker.setPlayerRole(TypePlayerRole.Attacker);

    // this.defender = this.getNextPlayer();
    this.defender = this.getNextPlayer(this.attacker);
    this.defender.setPlayerRole(TypePlayerRole.Defender);

    this.round = new Round(this.deck);
    this.beatCardsArray = [];
    this.beatCardsPlacedArray = [];
    this.round.setDefenderCardsAtRoundStart(STARTING_CARDS_NUMBER);

    this.passCounterMaxValue = this.players.totalCount() - 1;

    // Save start time
    this.gameTimeStart = Date.now();

    // Save first player socketId in this round
    this.round.setStartPlayerSocketId(this.activePlayer.getSocketId());

    // Send game status for all players
    return true;
  }

  /**
   * Restarts game room
   *
   * @returns
   */
  public restart(): TypeGameError | true {
    if (this.getRoomStatus() !== TypeRoomStatus.GameIsOver) {
      return {
        type: TypeGameErrorType.GameRestartFailed,
        message: "Room does not have status 'GameIsOver'",
      };
    }

    if (this.players.totalCount() < MIN_NUMBER_OF_PLAYERS) {
      return {
        type: TypeGameErrorType.GameRestartFailed,
        message: "Room doesn't have minimum number of players",
      };
    }

    this.roomStatus = TypeRoomStatus.WaitingForStart;
    // reset player statuses after restart
    for (const player of this.players) {
      player.setPlayerStatus(TypePlayerStatus.InGame);
      player.cards = [];
    }

    this.start();

    return true;
  }

  public open(): TypeGameError | true {
    if (this.getRoomStatus() !== TypeRoomStatus.GameIsOver) {
      return {
        type: TypeGameErrorType.GameRoomOpenFailed,
        message: "Room does not have status 'GameIsOver'",
      };
    }

    if (this.getPlayersCount() >= 2) {
      this.roomStatus = TypeRoomStatus.WaitingForStart;
    } else {
      this.roomStatus = TypeRoomStatus.WaitingForPlayers;
    }
    // reset player statuses after restart
    for (const player of this.players) {
      player.setPlayerStatus(TypePlayerStatus.InGame);
      player.cards = [];
    }

    return true;
  }

  /**
   * Adds chat message
   */
  public addChatMessage(
    socketId: string,
    message: string,
  ): TypeGameError | true {
    const player = this.players.getPlayerBySocketId(socketId);

    if (!player) {
      return {
        type: TypeGameErrorType.MessageSendFailed,
        message: 'Player not found',
      };
    }

    const timestamp = Date.now();

    this.chat.push({
      sender: player.getPlayerAsDto(),
      timestamp,
      message,
    });

    return true;
  }

  /**
   * Give one card from attacker
   */
  public setAttackerOpen(card: TypeCard): TypeGameError | true {
    if (this.activePlayer.getPlayerRole() !== TypePlayerRole.Attacker) {
      return {
        type: TypeGameErrorType.OpenCardFailed,
        message: "Active player doesn't have Attacker role",
      };
    }

    this.LastGameAction = TypeGameAction.AttackerMoveCard;
    this.isDealtEnabled = false;

    const isAttackSuccess = this.round.attack(card);

    if (!isAttackSuccess) {
      this.LastGameAction = TypeGameAction.AttackerMoveCardFailed;

      return {
        type: TypeGameErrorType.OpenCardFailed,
        message:
          'Not the first attack in the round & card does not match the rank of any card on the table',
      };
    }

    // Remove card from player cards array
    this.activePlayer.lostCard(card);

    // Reset pass counter (but do not reset if defender decides to pickup - no
    // new card ranks will appear on the table)
    if (!this.isDefenderPickup) {
      this.passCounter = 0;
    }

    // Check game is finish for attacker
    if (this.isActivePlayerWin()) {
      this.setPlayerAsWinner(this.activePlayer);
      this.attacker = this.getNextAttacker(this.activePlayer);
      this.attacker.setPlayerRole(TypePlayerRole.Attacker);
    }

    // Move turn to defender from attacker
    if (!this.isDefenderPickup) {
      this.setActivePlayer(this.defender);
    }

    if (this.isDefenderPickup && this.round.isFinished()) {
      this.GivePickedupCardsToDefender();
      this.startNextRound();
    }

    return true;
  }

  /**
   * Give one card from defender
   */
  public setDefenderClose(card: TypeCard): TypeGameError | true {
    if (this.activePlayer.getPlayerRole() !== TypePlayerRole.Defender) {
      return {
        type: TypeGameErrorType.CloseCardFailed,
        message: "Active player doesn't have Defender role",
      };
    }

    this.LastGameAction = TypeGameAction.DefenderMoveCard;
    this.lastDefender = this.activePlayer;

    // Add the card
    if (!this.round.defend(card)) {
      this.LastGameAction = TypeGameAction.DefenderMoveCardFailed;

      return {
        type: TypeGameErrorType.CloseCardFailed,
        message: "This card of the defender can't beat attacker's card",
      };
    }

    // Remove card from player cards array
    this.activePlayer.lostCard(card);

    if (this.isActivePlayerWin()) {
      this.setPlayerAsWinner(this.activePlayer);

      // beats last card of the last attacker with their own last card - draw
      if (this.players.totalCountInGame() === 0) {
        this.lastLoser = null;
        this.setGameIsOver();
        return true;
      }

      // Check attacker as YouLoser
      if (
        this.attacker.getCardsCount() > 0 &&
        this.players.totalCountInGame() === 1
      ) {
        this.attacker.setPlayerStatus(TypePlayerStatus.YouLoser);
        this.lastLoser = this.attacker;
        this.setGameIsOver();
        return true;
      }

      this.activePlayer = this.getNextPlayer(this.activePlayer);
      this.startNextRound();
      return true;
    }

    // Defender beats last attacker's last card with their own card, but still
    // loses (it was not their last card)
    if (this.players.totalCountInGame() === 1) {
      this.activePlayer.setPlayerStatus(TypePlayerStatus.YouLoser);
      this.lastLoser = this.activePlayer;
      this.setGameIsOver();
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
  public setAttackerPass(): TypeGameError | true {
    if (this.activePlayer.getPlayerRole() !== TypePlayerRole.Attacker) {
      return {
        type: TypeGameErrorType.AttackerPassFailed,
        message: "Active player doesn't have Attacker role",
      };
    }

    this.LastGameAction = TypeGameAction.AttackerPass;

    this.passCounter += 1;

    if (this.passCounter === this.passCounterMaxValue) {
      if (this.isDefenderPickup) {
        this.GivePickedupCardsToDefender();
      } else {
        // Defender becomes attacker
        this.setActivePlayer(this.defender);
      }

      this.startNextRound();

      return true;
    }

    this.activePlayer.setPlayerRole(TypePlayerRole.Waiting);

    this.attacker = this.getNextAttacker(this.activePlayer);
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
  public setDefenderPickUpCards(): TypeGameError | true {
    if (this.activePlayer.getPlayerRole() !== TypePlayerRole.Defender) {
      return {
        type: TypeGameErrorType.DefenderPickupFailed,
        message: "Active player doesn't have Defender role",
      };
    }

    this.LastGameAction = TypeGameAction.DefenderDecidesToPickUp;

    this.lastDefender = this.activePlayer;

    // Check game is finish for defender
    if (this.players.totalCountInGame() === 1) {
      this.activePlayer.addCards(this.round.getRoundCards());
      this.activePlayer.setPlayerStatus(TypePlayerStatus.YouLoser);
      this.lastLoser = this.activePlayer;
      this.setGameIsOver();

      return true;
    }

    this.isDefenderPickup = true;

    if (this.round.isFinished()) {
      this.GivePickedupCardsToDefender();
      this.startNextRound();
    }

    // Move turn back to attacker
    this.setActivePlayer(this.attacker);
    return true;
  }

  private GivePickedupCardsToDefender(): void {
    this.LastGameAction = TypeGameAction.DefenderTakesCards;
    this.isDefenderPickup = false;
    this.lastDefender.addCards(this.round.getRoundCards());

    // Next after active player (defender)
    // this.setActivePlayer(this.getNextPlayer());
    this.activePlayer = this.getNextPlayer(this.lastDefender);
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
    this.defender = this.getNextPlayer(this.attacker);

    if (this.defender === this.attacker) {
      this.log(`Room #${this.roomId} - Can't set next defender`);

      this.lastLoser = this.defender;
      this.setGameIsOver();

      return;
    }

    this.defender.setPlayerRole(TypePlayerRole.Defender);

    // Dealt cards to user
    this.dealtCards();

    this.round.setDefenderCardsAtRoundStart(this.defender.getCardsCount());

    // Save first player socketId in this round,
    // after dealt only
    this.round.setStartPlayerSocketId(this.activePlayer.getSocketId());

    // Restart round
    this.beatCardsArray.push(this.round.getRoundCards());
    this.beatCardsPlacedArray.push(this.round.getRoundCardsAsPlaced());
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
   * @returns
   */
  public joinRoom(player: Player): TypeGameError | true {
    if (
      ![
        TypeRoomStatus.WaitingForPlayers,
        TypeRoomStatus.WaitingForStart,
      ].includes(this.getRoomStatus())
    ) {
      return {
        type: TypeGameErrorType.JoinRoomFailed,
        message: 'Room is closed and not waiting for new players',
      };
    }

    if (this.players.totalCount() === MAX_NUMBER_OF_PLAYERS) {
      return {
        type: TypeGameErrorType.JoinRoomFailed,
        message: 'Room already has maximum number of players',
      };
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

    // host leaves, we need new host
    if (leavePlayer.getSocketId() === this.getHostPlayerSocketId()) {
      this.hostPlayer = this.getNextPlayer(leavePlayer);
    }

    // Game over if player who still InGame decides to leave
    if (
      this.isGameInProgress() &&
      leavePlayer.getPlayerStatus() === TypePlayerStatus.InGame
    ) {
      leavePlayer.setPlayerStatus(TypePlayerStatus.YouLoser);
      this.lastLoser = leavePlayer;

      // Set all players as winner
      for (const player of this.players) {
        if (player.getPlayerStatus() !== TypePlayerStatus.YouLoser) {
          this.setPlayerAsWinner(player);
        }
      }

      this.setGameIsOver();

      // active player left (and lost), stats were updated
      // but we don't have lastLoser at the start of next game session
      this.lastLoser = null;
    }

    this.players.remove(leavePlayer);

    if (
      this.getRoomStatus() === TypeRoomStatus.WaitingForStart &&
      this.getPlayersCount() < MIN_NUMBER_OF_PLAYERS
    ) {
      this.roomStatus = TypeRoomStatus.WaitingForPlayers;
    }

    return true;
  }

  /**
   * Returns player who is sitting to the right of last loser
   */
  private findPreviousPlayerToLastLoser(loser: Player): Player {
    return this.getPrevPlayer(loser);
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

  private getNextAttacker(currentAttacker: Player): Player {
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

  private getNextPlayer(current: Player): Player {
    const index = this.players.getPlayerIndexBySocketId(current.getSocketId());

    const playersAll = this.players.getAll();

    const players = [
      ...playersAll.slice(index + 1),
      ...playersAll.slice(0, index),
    ].filter((player) => player.getPlayerStatus() === TypePlayerStatus.InGame);

    return players[0];
  }

  private getPrevPlayer(current: Player): Player {
    const index = this.players.getPlayerIndexBySocketId(current.getSocketId());

    const playersAll = this.players.getAll();

    const players = [
      ...playersAll.slice(index + 1),
      ...playersAll.slice(0, index),
    ]
      .filter((player) => player.getPlayerStatus() === TypePlayerStatus.InGame)
      .reverse();

    return players[0];
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

  public getActivePlayerSocketId(): string {
    return this.activePlayer.getSocketId();
  }

  public getHostPlayerSocketId(): string {
    return this.hostPlayer.getSocketId();
  }

  public getGameStats(): TypeGameStats {
    return this.gameStats;
  }

  /**
   * Updates game stats and saves game results to DB
   */
  private async updateGameStats(): Promise<void> {
    // Update stats
    this.gameStats = {
      roomId: this.roomId,
      players: this.startingPlayerNames.join('#'),
      loser: this.lastLoser ? this.lastLoser.getPlayerName() : 'undefined',
      duration: Date.now() - this.gameTimeStart,
      rounds: this.currentRound,
    };

    // Write stats to DB
    await this.gameService.updateGameHistory(this.gameStats);

    // Update players stats
    for (const playerName of this.startingPlayerNames) {
      const isLoser =
        this.lastLoser && this.lastLoser.getPlayerName() === playerName;
      await this.gameService.updatePlayerStats(playerName, isLoser ? 0 : 1);
    }
  }

  /**
   * Set game is over
   */
  private setGameIsOver(): void {
    this.roomStatus = TypeRoomStatus.GameIsOver;

    this.updateGameStats();
  }

  /**
   * Returns room state
   * @returns {TypeRoomState}  - Room state
   */
  public getState(): TypeRoomState {
    return {
      roomId: this.roomId,
      roomStatus: this.roomStatus || TypeRoomStatus.WaitingForPlayers,
      hostSocketId: this.hostPlayer?.getSocketId(),
      activeSocketId: this.activePlayer?.getSocketId(),
      players: this.players.getPlayersAsDto(),
      chat: this.chat,
      trumpCard: this.getDeck().getTrumpCard().getCardDto() || {
        rank: TypeCardRank.RANK_6,
        suit: TypeCardSuit.Clubs,
      },
      placedCards: this.getPlacedCards() || [],
      dealt: this.dealt,
      isDealtEnabled: this.isDealtEnabled,
      deckCounter: this.deck.getSize(),
      currentRound: this.currentRound,
      lastGameAction: this.LastGameAction,
      beatCardsArray: this.beatCardsArray,
      beatCardsPlacedArray: this.beatCardsPlacedArray,
    };
  }

  private log(message: string): void {
    this.logger.debug(message);
  }
}
