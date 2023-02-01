import { Deck } from './Deck';
import { Player } from './Player';
import {
  STARTING_CARDS_NUMBER,
  MIN_ROOM_SIZE,
  MAX_ROOM_SIZE,
} from '../constants';
import { Logger } from '@nestjs/common';
import { Round } from './Round';
import { TypeRoomStatus } from '../types/TypeRoomStatus';
import { CardDto } from './CardDto';
import { TypeEventPayload, TypePlayerStatus, TypeRoomEvent } from '../types';

/**
 * Class Room
 */
export class Room {
  roomId: string;
  host: Player;
  players: Player[]; //Players;
  roomStatus: TypeRoomStatus;
  deck: Deck | null;
  round: Round;
  roundNumber: number;
  gameTimeStart: number;

  attacker: Player | null;
  defender: Player | null;

  gameService: null;
  logger: Logger;

  passCounter: number;
  passCounterMaxValue: number;

  constructor(roomId: string, host: Player, gameService: null) {
    this.roomId = roomId;
    this.host = host;
    this.players = [];
    this.roomStatus = TypeRoomStatus.WaitingForPlayers;
    this.deck = null;
    this.roundNumber = 0;

    this.attacker = null;
    this.defender = null;

    // For emitting events
    this.gameService = gameService;
    this.passCounter = 0;
    this.passCounterMaxValue = 1;

    // TODO: change dependency injection
    this.logger = new Logger(`Room #${roomId}`);
  }

  /**
   * Start game room
   *
   * @returns
   */
  start(): void {
    if (this.roomStatus !== TypeRoomStatus.WaitingForStart) {
      return;
    }

    // Start new deck
    this.deck = new Deck(this.players.length);

    for (const player of this.players) {
      player.addCards(this.deck.getCardsFromDeck(STARTING_CARDS_NUMBER));
    }

    // Set round number
    this.roundNumber = 1;

    // Set attacker as player with lowest trump
    this.attacker = this.findPlayerWithLowestTrump();

    this.defender = this.getNextPlayer(this.attacker.getPlayerId());

    // Game is started
    this.roomStatus = TypeRoomStatus.GameInProgress;

    this.round = new Round(this.deck);

    this.emitEvent(TypeRoomEvent.fromServerGameStart);

    // Send status open for attacker
    // На фронте делается логика для gameAttackerSetActive
    this.emitEvent(TypeRoomEvent.fromServerAttackerSetActive, {
      playerId: this.attacker.getPlayerId(),
    });

    // Save start time
    this.gameTimeStart = Date.now();
  }

  /**
   * Give one card from attacker
   */
  public attackerOpen(cardDto: CardDto) {
    if (this.attacker === null) {
      throw new Error("Can't found attacker. Something went wrong.");
    }

    // Add the card
    if (!this.round.attack(cardDto)) {
      // Something went wrong, motherfucker
      this.emitEvent(TypeRoomEvent.fromServerAttackerOpenFail);

      return;
    }

    // Remove card from player cards array
    this.attacker.lostCard(cardDto);

    // Reset pass counter
    this.passCounter = 0;

    // Update player winner status
    this.updatePlayerWinnerStatus(this.attacker);

    // Card added successfully, send message to client
    this.emitEvent(TypeRoomEvent.fromServerAttackerOpenSuccess);

    // Check game is finished for attacker
    if (this.attacker.cards.length === 0) {
      this.attacker.setPlayerStatus(TypePlayerStatus.YouWinner);
    }
  }

  /**
   * Give one card from defender
   */
  public defenderClose(cardDto: CardDto) {
    if (this.defender === null) {
      throw new Error("Can't found defender. Something went wrong.");
    }

    // Add the card
    if (!this.round.defend(cardDto)) {
      // Something went wrong, motherfucker
      this.emitEvent(TypeRoomEvent.fromServerDefenderCloseFail);

      return;
    }

    // Remove card from player cards array
    this.defender.lostCard(cardDto);

    // Card added successfully, send message to client
    this.emitEvent(TypeRoomEvent.fromServerDefenderCloseSuccess);

    // Update player winner status
    this.updatePlayerWinnerStatus(this.defender);

    // Check and update Room status
    this.updateWhenTheGameIsOver();

    this.startNextRoundStep();
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

  updatePlayerWinnerStatus(player: Player | null) {
    if (player && player.getCardsCount() === 0) {
      player.setPlayerStatus(TypePlayerStatus.YouWinner);

      this.emitEvent(TypeRoomEvent.fromServerSendPlayerStatus, {
        playerId: player.getPlayerId(),
        playerStatus: TypePlayerStatus.YouWinner,
      });
    }
  }

  startNextRoundStep(): void {
    if (this.roomStatus === TypeRoomStatus.GameIsOver) {
      // Game is over nothing to do
      return;
    }

    // Если двое переход хода старт нового раунда
    if (this.players.length === 2) {
      const oldAttacker = this.attacker;
      this.attacker = this.defender;
      this.defender = oldAttacker;

      return this.startNextRound();
    }

    if (this.attacker === null) {
      throw new Error("Can't get player index. Something went very wrong");
    }

    this.attacker = this.getNextPlayer(this.attacker.getPlayerId());

    if (this.attacker === null) {
      throw new Error("Can't get player index. Something went very wrong");
    }

    if (this.attacker.getPlayerId() === this.defender?.getPlayerId()) {
      this.attacker = this.getNextPlayer(this.attacker.getPlayerId());
    }

    this.log(`Room #${this.roomId} - Start next round step`);
  }

  startNextRound() {
    if (this.roomStatus === TypeRoomStatus.GameIsOver) {
      // Game is over nothing to do
      return;
    }

    this.log(`Room #${this.roomId} - Start next round`);
  }

  /**
   * Getter for this.players.size
   */
  get size(): number {
    return this.players.length;
  }

  /**
   * Add new player to the room
   * @param player
   * @returns
   */
  addPlayer(player: Player): void {
    if (this.size === MAX_ROOM_SIZE) {
      return;
    }

    this.players.push(player);

    if (
      this.roomStatus === TypeRoomStatus.WaitingForPlayers &&
      this.size >= MIN_ROOM_SIZE // TODO: change it to MIN_NUMBER_OF_PLAYERS
    ) {
      this.roomStatus = TypeRoomStatus.WaitingForStart;
    }
  }

  /**
   * Returns is active players in game
   * @returns Players array by TypePlayerStatus.InGame
   */
  getPlayersInGame() {
    return this.players.filter((player) => {
      return player.getPlayerStatus() === TypePlayerStatus.InGame;
    });
  }

  getPrevPlayer(playerId: string): Player {
    const playersInGame = this.getPlayersInGame();

    const idx = playersInGame.findIndex((player) => player.name === playerId);

    idx === 0
      ? playersInGame[playersInGame.length - 1]
      : playersInGame[idx - 1];

    return playersInGame[idx];
  }

  getNextPlayer(playerId: string) {
    const playersInGame = this.getPlayersInGame();

    const idx = playersInGame.findIndex((player) => player.name === playerId);

    return playersInGame[(idx + 1) % playersInGame.length];
  }

  findPlayerWithLowestTrump(): Player {
    if (this.deck === null) {
      return this.host;
    }

    const trumpSuit = this.deck.getTrumpSuit();

    let foundPlayer = null;

    let lowestTrumpCardRank = Infinity;

    for (const player of this.players) {
      for (const card of player.cards) {
        if (card.suit === trumpSuit && card.rank < lowestTrumpCardRank) {
          lowestTrumpCardRank = card.rank;
          foundPlayer = player;
        }
      }
    }

    return foundPlayer ? foundPlayer : this.host;
  }

  /**
   * Check game is finish
   * Update game stats and other actions
   */
  updateWhenTheGameIsOver() {
    // Get all players in the game
    const players = this.players.filter(
      (player) => player.getPlayerStatus() === TypePlayerStatus.InGame,
    );

    if (players.length === 1) {
      // Game over
      this.roomStatus = TypeRoomStatus.GameIsOver;

      // You loser
      players[0].setPlayerStatus(TypePlayerStatus.YouLoser);

      this.emitEvent(TypeRoomEvent.fromServerSendPlayerStatus, {
        playerId: players[0].getPlayerId(),
        playerStatus: TypePlayerStatus.YouLoser,
      });

      // All players request personal status after this event ** Client -> Server **
      this.emitEvent(TypeRoomEvent.fromServerGameOver);

      // Update game stats and other actions
      // ...

      this.log(`Room #${this.roomId} - Game over!`);
    }
  }

  /**
   * Emit event from server to client
   *
   * @param {TypeRoomEvent} event Event type as string
   * @param data TypeEventPayload
   */
  emitEvent(event: TypeRoomEvent, data: TypeEventPayload | null = null) {
    console.log(data);
    // this.gameService.emit(this.roomId, event, data);
  }

  log(message: string) {
    this.logger.log(message);
  }
}
