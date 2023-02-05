import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Player } from '../shared/libs/Player';
import {
  TypePlayerMember,
  TypeServerResponse,
  TypeRoomEvent,
} from '../shared/types';
import { generateRoomId } from '../shared/utils/generateRoomId';
import { IGameService } from '../shared/interfaces';
import { Room } from '../shared/libs/Room';
import { GameReceiveDto, GameSendDto } from './dto';
import { MAX_NUMBER_OF_PLAYERS } from 'src/shared/constants';

@Injectable()
export class GameService implements IGameService {
  private rooms: Map<string, Room>;
  public server: Server;

  constructor() {
    this.rooms = new Map();
  }

  private getRoom(roomId: string) {
    if (!this.rooms.has(roomId)) {
      throw new Error(`Room #${roomId} not found.`);
    }

    return this.rooms.get(roomId);
  }

  async setFromClientCreateRoom(data: GameReceiveDto, socket: Socket) {
    const hostPlayer = new Player(socket, data.playerId, TypePlayerMember.Host);

    let roomId = '';
    do {
      roomId = generateRoomId();
    } while (this.rooms.has(roomId));

    socket.join(roomId);

    const room = new Room(roomId, hostPlayer, this);

    this.rooms.set(roomId, room);

    console.log(room);

    // Send to client message: Room is created
    socket.emit(TypeRoomEvent.gameFromServerRoomStatusChange, {
      roomId: room.roomId,
      roomStatus: room.roomStatus,
    });
  }

  async setFromClientGetRooms(data: GameReceiveDto) {
    console.log('setFromClientGetRooms', data);
    const rooms = Array.from(this.rooms).map(([roomId, room]) => {
      return {
        roomId,
        playersCount: room.getPlayersCount(),
        status: room.getRoomStatus(),
      };
    });

    return rooms;
  }

  async setFromClientCreatePlayer(data: GameReceiveDto) {
    console.log('setCreatePlayer', data);
  }

  async setFromClientChatMessage(data: GameReceiveDto, socket: Socket) {
    const room = this.rooms.get(data.roomId);
    if (!room) {
      return false;
    }

    const player = room.getPlayers().getById(data.playerId);
    if (!player) {
      return false;
    }

    if (socket.id !== player.getSocketId()) {
      return false;
    }

    const message: GameSendDto = {
      source: player.getPlayerId(),
      timestamp: Date.now(),
      chatMessage: data.chatMessage,
    };

    socket
      .to(room.getRoomId())
      .emit(TypeRoomEvent.gameFromServerChatMessage, { data: message });
  }

  async setFromClientJoinRoom(data: GameReceiveDto, socket: Socket) {
    const room = this.rooms.get(data.roomId);
    if (!room) {
      const payload = {
        roomId: data.roomId,
        socket: socket,
        playerId: data.playerId,
      };
      this.setFromServerJoinRoomFail(payload);
      return false;
    }

    const player = new Player(socket, data.playerId, TypePlayerMember.Regular);

    socket.join(room.getRoomId());
    room.joinRoom(player);
  }

  async setFromClientLeaveRoom(data: GameReceiveDto, socket: Socket) {
    console.log('setLeaveRoom', data);
    const room = this.rooms.get(data.roomId);
    if (!room) {
      return false;
    }

    const player = room.getPlayers().getById(data.playerId);
    if (!player) {
      return false;
    }
    if (socket.id !== player.getSocketId()) {
      return false;
    }

    socket.leave(room.getRoomId());

    room.leaveRoom(data.playerId);
  }

  async setFromClientStartGame(data: GameReceiveDto, socketId: string) {
    console.log('setStartGame', data);
    const room = this.rooms.get(data.roomId);
    if (!room || socketId !== room.getHostPlayer().getSocketId()) {
      return false;
    }
    room.start();
  }

  async setFromClientAttackerOpen(data: GameReceiveDto) {
    console.log('setAttackerOpen', data);
  }

  async setFromClientAttackerPass(data: GameReceiveDto) {
    console.log('setAttackerPass', data);
  }

  async setFromClientDefenderClose(data: GameReceiveDto) {
    console.log('setDefenderClose', data);
  }

  async setFromClientDefenderTake(data: GameReceiveDto) {
    console.log('setDefenderTake', data);
  }

  async setFromClientSettings(data: GameReceiveDto) {
    console.log('setSettings', data);
  }

  async setFromClientRestartGame(data: GameReceiveDto, socketId: string) {
    console.log('setFromClientRestartGame', data);
    const room = this.rooms.get(data.roomId);
    if (!room || socketId !== room.getHostPlayer().getSocketId()) {
      return false;
    }
    room.restartGame();
  }

  async setFromClientOpenRoom(data: GameReceiveDto, socketId: string) {
    console.log('setFromClientOpenRoom');
    const room = this.rooms.get(data.roomId);
    if (
      !room ||
      room.getPlayersCount() === MAX_NUMBER_OF_PLAYERS ||
      socketId !== room.getHostPlayer().getSocketId()
    ) {
      return false;
    }
    room.openRoom();
  }

  /** Emit event gameFromServerRoomStatusChange to client
   * Type: Broadcast
   *
   * Sends data: {
   *   roomId: string;
   *   roomStatus: TypeRoomStatus
   * }
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerRoomStatusChange(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerRoomStatusChange, payload);
  }

  /**
   * Emit event gameFromServerJoinRoomSuccess to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerJoinRoomSuccess(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerJoinRoomSuccess, payload);
  }

  /**
   * Emit event gameFromServerJoinRoomFail to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerJoinRoomFail(payload: TypeServerResponse): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerJoinRoomFail, payload);
  }

  /**
   * Emit event gameFromServerLeaveRoomSuccess to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerLeaveRoomSuccess(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerJoinRoomSuccess, payload);
  }

  async setFromServerDealtCardsToPlayers(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerDealtCardsToPlayers, payload);
  }

  /**
   * Emit event gameFromServerAttackerSetActive to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerAttackerSetActive(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerAttackerSetActive, payload);
  }

  /**
   * Emit event gameFromServerAttackerOpenSuccess to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerAttackerOpenSuccess(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerAttackerOpenSuccess, payload);
  }

  /**
   * Emit event gameFromServerAttackerOpenFail to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerAttackerOpenFail(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerAttackerOpenFail, payload);
  }

  /**
   * Emit event gameFromServerAttackerPass to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerAttackerPass(payload: TypeServerResponse): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerAttackerPass, payload);
  }

  /**
   * Emit event gameFromServerDefenderSetActive to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerDefenderSetActive(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerDefenderSetActive, payload);
  }

  /**
   * Emit event gameFromServerDefenderCloseSuccess to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerDefenderCloseSuccess(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerDefenderCloseSuccess, payload);
  }

  /**
   * Emit event gameFromServerDefenderCloseFail to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerDefenderCloseFail(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerDefenderCloseFail, payload);
  }

  /**
   * Emit event gameFromServerSendPlayerStatus to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerSendPlayerStatus(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerSendPlayerStatus, payload);
  }

  /**
   * Emit event gameFromServerDefenderPickUpCards to client
   * @param {TypeServerResponse} payload Data for client sending
   */
  async setFromServerDefenderPickUpCards(
    payload: TypeServerResponse,
  ): Promise<void> {
    this.emitEvent(TypeRoomEvent.gameFromServerDefenderPickUpCards, payload);
  }

  /**
   * Send data to client
   * @param {TypeRoomEvent} type Type of  gameFromServer* event
   * @param {TypeServerResponse} payload Data for sending to client
   */
  async emitEvent(
    type: TypeRoomEvent,
    payload: TypeServerResponse,
  ): Promise<void> {
    let adapter: Server | Socket = this.server;

    const { socket, ...data } = payload;

    if (socket) {
      adapter = socket;
    }

    adapter.to(payload.roomId).emit(type, {
      data: {
        ...data,
      },
    });
  }
}
