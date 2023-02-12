import { RatingService } from './../rating/rating.service';
import { HistoryService } from './../history/history.service';
import {
  TypePlayerMember,
  TypeServerResponse,
  TypeRoomList,
  TypeGameErrorType,
  TypeCard,
  TypeGameStats,
} from './../shared/types';

import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Player } from '../shared/libs/Player';
import { generateRoomId } from '../shared/utils/generateRoomId';
import { Room } from '../shared/libs/Room';
import { GameReceiveDto } from './dto';

@Injectable()
export class GameService {
  private rooms: Map<string, Room>;
  public server: Server;

  constructor(
    private historyService: HistoryService,
    private ratingService: RatingService,
  ) {
    this.rooms = new Map();
  }

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
        playersCount: room.getPlayersCount(),
        status: room.getRoomStatus(),
      };
    });

    return rooms;
  }
  /**
   * Create room
   * @param {GameReceiveDto} data
   * @param {Socket} socket - Client socket
   * @returns {TypeServerResponse} - Data for send as a payload to client
   */
  public createRoom(data: GameReceiveDto, socket: Socket): TypeServerResponse {
    const { playerName, playerAvatar } = data;

    const hostPlayer = new Player(
      socket,
      playerName,
      playerAvatar,
      TypePlayerMember.Host,
    );

    let roomId = '';

    do {
      roomId = generateRoomId();
    } while (this.rooms.has(roomId));

    socket.join(roomId);

    const room = new Room(roomId, hostPlayer, this);

    this.rooms.set(roomId, room);

    return this.createResponseObject({ roomId });
  }

  /**
   * Join player to room
   * @param {GameReceiveDto} data
   * @param {Socket} socket
   * @returns {void}
   */
  public joinRoom(data: GameReceiveDto, socket: Socket): TypeServerResponse {
    const { roomId, playerName, playerAvatar } = data;

    const room = this.rooms.get(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    const player = new Player(
      socket,
      playerName,
      playerAvatar,
      TypePlayerMember.Regular,
    );

    const result = room.joinRoom(player);

    if (result !== true) {
      return this.createResponseObject({
        roomId,
        error: result,
      });
    }

    socket.join(room.getRoomId());

    return this.createResponseObject({ roomId });
  }

  public setLeaveRoom(client: Socket): TypeServerResponse | null {
    const roomId = this.getRoomIdByClientSocket(client);

    // even if room no longer exists, socket may still have subscription to such room id
    client.leave(roomId);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    room.leaveRoom(client.id);

    if (room.getPlayersCount() === 0) {
      this.closeRoomById(roomId);

      return null;
    }

    return this.createResponseObject({ roomId });
  }

  public startGame(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    if (client.id !== room.getHostPlayerSocketId()) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameStartFailed,
          message: 'Only host player can start the game',
        },
      });
    }

    const result = room.start();
    if (result !== true) {
      return this.createResponseObject({ roomId, error: result });
    }

    return this.createResponseObject({ roomId });
  }

  public setChatMessage(
    data: GameReceiveDto,
    client: Socket,
  ): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    const result = room.addChatMessage(client.id, data.message);
    if (result !== true) {
      return this.createResponseObject({
        roomId,
        error: result,
      });
    }

    return this.createResponseObject({ roomId });
  }

  public setCardOpen(client: Socket, card: TypeCard): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    if (client.id !== room.getActivePlayerSocketId()) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.OpenCardFailed,
          message: 'Only active player is allowed to perform this action',
        },
      });
    }

    const result = room.setAttackerOpen(card);

    if (result !== true) {
      return this.createResponseObject({ roomId, error: result });
    }

    return this.createResponseObject({
      roomId,
    });
  }

  public setCardClose(client: Socket, card: TypeCard): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    if (client.id !== room.getActivePlayerSocketId()) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.CloseCardFailed,
          message: 'Only active player is allowed to perform this action',
        },
      });
    }

    const result = room.setDefenderClose(card);

    if (result !== true) {
      return this.createResponseObject({ roomId, error: result });
    }

    return this.createResponseObject({
      roomId,
    });
  }

  public setAttackerPass(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    if (client.id !== room.getActivePlayerSocketId()) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.AttackerPassFailed,
          message: 'Only active player is allowed to perform this action',
        },
      });
    }

    const result = room.setAttackerPass();
    if (result !== true) {
      return this.createResponseObject({ roomId, error: result });
    }

    return this.createResponseObject({
      roomId,
    });
  }

  /**
   * Event GamePickUpCards
   * @param {Socket} client - Socket client owner emitter
   */
  public setDefenderPickUpCards(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    if (client.id !== room.getActivePlayerSocketId()) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.DefenderPickupFailed,
          message: 'Only active player is allowed to perform this action',
        },
      });
    }

    // at the moment method always ends with success
    const result = room.setDefenderPickUpCards();
    if (result !== true) {
      return this.createResponseObject({ roomId, error: result });
    }

    return this.createResponseObject({
      roomId,
    });
  }

  public setGameRestart(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    if (client.id !== room.getHostPlayerSocketId()) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRestartFailed,
          message: 'Only host player can restart the game',
        },
      });
    }

    const result = room.restart();

    if (result !== true) {
      return this.createResponseObject({ roomId, error: result });
    }

    return this.createResponseObject({
      roomId,
    });
  }

  public setRoomOpen(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomNotFound,
          message: 'Room not found',
        },
      });
    }

    if (client.id !== room.getHostPlayerSocketId()) {
      return this.createResponseObject({
        roomId,
        error: {
          type: TypeGameErrorType.GameRoomOpenFailed,
          message: 'Only host player can open the room',
        },
      });
    }

    const result = room.open();

    if (result !== true) {
      return this.createResponseObject({ roomId, error: result });
    }

    return this.createResponseObject({
      roomId,
    });
  }

  public getRoomState(roomId: string): TypeServerResponse {
    return this.createResponseObject({ roomId });
  }

  public getRoomIdByClientSocket(client: Socket) {
    let roomId = '';

    loop1: for (const room of this.rooms.values()) {
      const players = room.getPlayers();

      for (const player of players) {
        if (player.getSocketId() === client.id) {
          roomId = room.getRoomId();

          break loop1;
        }
      }
    }

    return roomId;
  }

  public async updateGameHistory(stats: TypeGameStats): Promise<void> {
    if (stats.roomId) {
      this.historyService.create(stats);
    }
  }

  public async updatePlayerStats(player: string, wins: number) {
    const playerInfo = await this.ratingService.findOne(player);

    if (playerInfo) {
      this.ratingService.update({
        player,
        wins: playerInfo.wins + wins,
        total: (playerInfo.total = 1),
        lastGameAt: Date.now(),
      });
    } else {
      this.ratingService.create({ player, wins, total: 1 });
    }
  }

  /**
   * Returns response object
   * @param {Partial<TypeServerResponse>} payload
   * @returns {TypeServerResponse}
   */
  private createResponseObject(
    payload: TypeServerResponse,
  ): TypeServerResponse {
    const { roomId } = payload;

    const room = this.getRoomById(roomId);

    if (room) {
      return {
        ...room.getState(),
        ...payload,
      };
    }

    throw new Error('Room not found. Something went wrong.');
  }

  public hasPlayerInRoomByClientSocket(client: Socket): boolean {
    return !!this.getRoomIdByClientSocket(client);
  }
}
