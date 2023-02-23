import { UserService } from './../user/user.service';
import { getErrorMessage } from '../../shared/helpers';
import { RatingService } from '../rating/rating.service';
import { HistoryService } from './../history/history.service';
import {
  TypePlayerMember,
  TypeServerResponse,
  TypeRoomList,
  TypeGameErrorType,
  TypeCard,
  TypeGameStats,
  TypeGameError,
} from '../../shared/types';

import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Player } from '../../shared/libs/Player';
import { generateRoomId } from '../../shared/utils/generateRoomId';
import { Room } from '../../shared/libs/Room';
import { GameReceiveDto, RoomCreateDto, RoomJoinDto } from './dto';

@Injectable()
export class GameService {
  private rooms: Map<string, Room>;
  public server: Server;
  private roomId: string;
  private room: Room | null;

  constructor(
    private historyService: HistoryService,
    private ratingService: RatingService,
    private userService: UserService,
  ) {
    this.rooms = new Map();
    this.roomId = '';
    this.room = null;
  }

  /**
   * Set room and rooId
   *
   * @param ident - roomId or client socket
   */
  private initRoom(ident: string | Socket): void {
    if (ident instanceof Socket) {
      this.roomId = this.getRoomIdByClientSocket(ident);
    } else if (typeof ident === 'string') {
      this.roomId = ident;
    } else {
      this.roomId = '';
      this.room = null;

      return;
    }

    this.room = this.getRoomById(this.roomId);
  }

  /**
   * Returns Room instance or null
   * @param {string} roomId
   * @returns - Room instance or null if room not exists
   */
  private getRoomById(roomId: string): Room | null {
    const room = this.rooms.get(roomId);

    if (room === undefined) {
      return null;
    }

    return room;
  }

  private closeRoomById(roomId: string): void {
    if (this.rooms.has(roomId)) {
      this.rooms.delete(roomId);
    }
  }

  public getRooms(): TypeRoomList {
    const rooms = Array.from(this.rooms).map(([roomId, room]) => {
      return {
        roomId,
        players: room.getPlayersAsDto(),
        playersCount: room.getPlayersCount(),
        status: room.getRoomStatus(),
      };
    });

    return rooms;
  }

  /**
   * Create room
   *
   * Event: GameCreateRoom
   *
   * @param {GameReceiveDto} data
   * @param {Socket} socket - Socket client owner emitter
   * @returns {TypeServerResponse } - Server response object
   */
  public async createRoom(
    data: RoomCreateDto,
    socket: Socket,
  ): Promise<TypeServerResponse> {
    const { userId, testCaseName } = data;

    const user = await this.userService.findById(userId);

    if (!user) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.UserNotFound,
        message: 'User not found.',
      });
    }

    const hostPlayer = new Player(
      socket,
      user.id,
      user.username,
      user.avatar,
      TypePlayerMember.Host,
    );

    let roomId = '';

    do {
      roomId = generateRoomId();
    } while (this.rooms.has(roomId));

    this.roomId = roomId;

    socket.join(this.roomId);

    // RoomTestFactory
    const _testCaseName = testCaseName || '';

    this.room = new Room(this.roomId, hostPlayer, this, _testCaseName);

    this.rooms.set(this.roomId, this.room);

    return this.createResponseObject();
  }

  /**
   * Join player to room
   *
   * Event: GameJoinRoom
   *
   * @param {GameReceiveDto} data - Player data
   * @param {Socket} client - Socket client owner emitter
   * @returns {TypeServerResponse } - Server response object
   */
  public async joinRoom(
    data: RoomJoinDto,
    socket: Socket,
  ): Promise<TypeServerResponse> {
    const { userId, roomId } = data;

    const user = await this.userService.findById(userId);

    if (!user) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.UserNotFound,
        message: 'User not found.',
      });
    }

    this.initRoom(roomId);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    const player = new Player(
      socket,
      user.id,
      user.username,
      user.avatar,
      TypePlayerMember.Regular,
    );

    const result = this.room.joinRoom(player);

    if (result !== true) {
      return this.createResponseErrorObject(result);
    }

    socket.join(this.room.getRoomId());

    return this.createResponseObject();
  }

  /**
   * Player leave room
   *
   * Event: GameLeaveRoom
   *
   * @param {Socket} client - Socket client owner emitter
   * @returns {TypeServerResponse | null} - Server response object or null
   */
  public setLeaveRoom(client: Socket): TypeServerResponse | null {
    this.initRoom(client);

    // Even if room no longer exists, socket may still have subscription to such room id
    client.leave(this.roomId);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    this.room.leaveRoom(client.id);

    if (this.room.getPlayersCount() === 0) {
      this.closeRoomById(this.roomId);

      return null;
    }

    return this.createResponseObject();
  }

  /**
   * Host player start game
   *
   * Event: GameStart
   *
   * @param {Socket} client - Socket client owner emitter
   * @returns {TypeServerResponse} - Server response object
   */
  public startGame(client: Socket): TypeServerResponse {
    this.initRoom(client);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    if (client.id !== this.room.getHostPlayerSocketId()) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameStartFailed,
      });
    }

    const result = this.room.start();

    if (result !== true) {
      return this.createResponseErrorObject(result);
    }

    return this.createResponseObject();
  }

  public setChatMessage(
    data: GameReceiveDto,
    client: Socket,
  ): TypeServerResponse {
    this.initRoom(client);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    const result = this.room.addChatMessage(client.id, data.message);

    if (result !== true) {
      return this.createResponseErrorObject(result);
    }

    return this.createResponseObject();
  }

  /**
   * Player attacker put card on the table
   *
   * Event: GameCardOpen
   *
   * @param {Socket} client - Socket client owner emitter
   * @param {TypeCard} card - Card from player
   * @returns {TypeServerResponse} - Server response object
   */
  public setCardOpen(client: Socket, card: TypeCard): TypeServerResponse {
    this.initRoom(client);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    if (client.id !== this.room.getActivePlayerSocketId()) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.OpenCardFailed,
      });
    }

    const result = this.room.setAttackerOpen(card);

    if (result !== true) {
      return this.createResponseErrorObject(result);
    }

    return this.createResponseObject();
  }

  /**
   * Player defender try yo beat card
   *
   * Event: GameCardClose
   *
   * @param {Socket} client - Socket client owner emitter
   * @param {TypeCard} card - Card from player
   * @returns {TypeServerResponse} - Server response object
   */
  public setCardClose(client: Socket, card: TypeCard): TypeServerResponse {
    this.initRoom(client);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    if (client.id !== this.room.getActivePlayerSocketId()) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.CloseCardFailed,
      });
    }

    const result = this.room.setDefenderClose(card);

    if (result !== true) {
      return this.createResponseErrorObject(result);
    }

    return this.createResponseObject();
  }

  /**
   * Player attacker pass
   *
   * Event: GameAttackerPass
   *
   * @param  {Socket} client - Socket client owner emitter
   * @returns {TypeServerResponse} - Server response object
   */
  public setAttackerPass(client: Socket): TypeServerResponse {
    this.initRoom(client);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    if (client.id !== this.room.getActivePlayerSocketId()) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.AttackerPassFailed,
      });
    }

    const result = this.room.setAttackerPass();

    if (result !== true) {
      return this.createResponseErrorObject(result);
    }

    return this.createResponseObject();
  }

  /**
   * Player defender takes card
   *
   * Event: GamePickUpCards
   *
   * @param  {Socket} client - Socket client owner emitter
   * @returns {TypeServerResponse} - Server response object
   */
  public setDefenderPickUpCards(client: Socket): TypeServerResponse {
    this.initRoom(client);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    if (client.id !== this.room.getActivePlayerSocketId()) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.DefenderPickupFailed,
      });
    }

    // at the moment method always ends with success
    const result = this.room.setDefenderPickUpCards();

    if (result !== true) {
      return this.createResponseErrorObject(result);
    }

    return this.createResponseObject();
  }

  /**
   * Restart game
   *
   * @param {Socket} client - Player who owner room
   * @returns {TypeServerResponse} - Server response object
   */
  public setGameRestart(client: Socket): TypeServerResponse {
    this.initRoom(client);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    if (client.id !== this.room.getHostPlayerSocketId()) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRestartFailed,
      });
    }

    const result = this.room.restart();

    if (result !== true) {
      return this.createResponseErrorObject(result);
    }

    return this.createResponseObject();
  }

  /**
   * Open game for invite new players
   *
   * @param {Socket} client - Player who owner room
   * @returns {TypeServerResponse} - Server response object
   */
  public setRoomOpen(client: Socket): TypeServerResponse {
    this.initRoom(client);

    if (!this.room) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomNotFound,
      });
    }

    if (client.id !== this.room.getHostPlayerSocketId()) {
      return this.createResponseErrorObject({
        type: TypeGameErrorType.GameRoomOpenFailed,
      });
    }

    const result = this.room.open();

    if (result !== true) {
      return this.createResponseErrorObject(result);
    }

    return this.createResponseObject();
  }

  /**
   * Return room id as sting
   *
   * Used in WebSocketGateway same
   *
   * @param {Socket} client
   * @returns {string} - Room id
   */
  public getRoomIdByClientSocket(client: Socket): string {
    let roomId = '';

    exitLoop: for (const room of this.rooms.values()) {
      const players = room.getPlayers();

      for (const player of players) {
        if (player.getSocketId() === client.id) {
          roomId = room.getRoomId();

          break exitLoop;
        }
      }
    }

    return roomId;
  }

  /**
   * Used by Room instance
   *
   * @param {TypeGameStats} stats
   */
  public async updateGameHistory(stats: TypeGameStats): Promise<void> {
    if (stats.roomId) {
      this.historyService.create(stats);
    }
  }

  /**
   * Used by Room instance
   *
   * @param {string} player
   * @param {number} wins - Player is win = 1 or else 0
   */
  public async updatePlayerStats(userId: number, player: string, wins: number) {
    const playerInfo = await this.ratingService.findOne(player);

    if (playerInfo) {
      this.ratingService.update({
        userId,
        player,
        wins: playerInfo.wins + wins,
        total: playerInfo.total + 1,
      });
    } else {
      this.ratingService.create({ userId, player, wins, total: 1 });
    }
  }

  /**
   * Return response object with room state
   *
   * @param {sting} roomId - Room id
   * @returns {TypeServerResponse} - Server response object
   */
  public getRoomState(roomId: string): TypeServerResponse {
    this.initRoom(roomId);

    return this.createResponseObject();
  }

  /**
   * Return response object with error object
   *
   * @param {TypeGameError} data - Type and error message
   * @returns {TypeServerResponse} - Server response object
   */
  private createResponseErrorObject(
    data: Partial<TypeGameError>,
  ): TypeServerResponse {
    const { message } = data;
    const type = data.type || TypeGameErrorType.UnknownError;

    return this.createResponseObject({
      error: {
        type,
        message: message || getErrorMessage(type),
      },
    });
  }

  /**
   * Returns response object
   *
   * @param {Partial<TypeServerResponse>} payload
   * @returns {TypeServerResponse}
   */
  private createResponseObject(
    payload?: Partial<TypeServerResponse>,
  ): TypeServerResponse {
    if (this.room) {
      return {
        ...this.room.getState(),
        ...(payload || {}),
      };
    }

    throw new Error('Room not found. Something went wrong.');
  }

  /**
   * Used in WebSocketGateway
   *
   * @param {Socket} client
   * @returns {boolean}
   */
  public hasPlayerInRoomByClientSocket(client: Socket): boolean {
    return !!this.getRoomIdByClientSocket(client);
  }
}
