import {
  TypePlayerMember,
  TypeServerResponse,
  TypeRoomList,
  TypeGameError,
  TypeCard,
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

  constructor() {
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
    const { playerName } = data;

    const hostPlayer = new Player(socket, playerName, TypePlayerMember.Host);

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
    const { roomId, playerName } = data;

    const room = this.rooms.get(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: TypeGameError.JoinRoomFailed,
      });
    }

    const player = new Player(socket, playerName, TypePlayerMember.Regular);

    if (room.joinRoom(player) === false) {
      return this.createResponseObject({
        roomId,
        error: TypeGameError.JoinRoomFailed,
      });
    }

    socket.join(room.getRoomId());

    return this.createResponseObject({ roomId });
  }

  public setLeaveRoom(client: Socket): TypeServerResponse | null {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (room === null) {
      return this.createResponseObject({
        roomId,
        error: TypeGameError.JoinRoomFailed,
      });
    }

    client.leave(roomId);

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

    if (room && room.start()) {
      return this.createResponseObject({ roomId });
    }

    return this.createResponseObject({
      roomId,
      error: TypeGameError.GameStartFailed,
    });
  }

  public setCardOpen(client: Socket, card: TypeCard): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (room && room.setAttackerOpen(card)) {
      return this.createResponseObject({ roomId });
    }

    return this.createResponseObject({
      roomId,
      error: TypeGameError.OpenCardFailed,
    });
  }

  public setCardClose(client: Socket, card: TypeCard): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (room && room.setDefenderClose(card)) {
      return this.createResponseObject({ roomId });
    }

    return this.createResponseObject({
      roomId,
      error: TypeGameError.CloseCardFailed,
    });
  }

  public setAttackerPass(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (room) {
      room.setAttackerPass();

      return this.createResponseObject({ roomId });
    }

    return this.createResponseObject({
      roomId,
      error: TypeGameError.GameRoomNotFound,
    });
  }

  /**
   * Event GamePickUpCards
   * @param {Socket} client - Socket client owner emitter
   */
  public setDefenderPickUpCards(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (room) {
      room.setDefenderPickUpCards();

      return this.createResponseObject({ roomId });
    }

    return this.createResponseObject({
      roomId,
      error: TypeGameError.GameRoomNotFound,
    });
  }

  public setGameRestart(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (room && room.restart(client.id)) {
      return this.createResponseObject({ roomId });
    }

    return this.createResponseObject({
      roomId,
      error: TypeGameError.GameRestartFailed,
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
