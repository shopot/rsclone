import { TypeGameError } from './../shared/types/TypeGameError';
import { TypeRoomList } from './../shared/types/TypeRoomList';
import {
  TypePlayerMember,
  TypeServerResponse,
  TypeRoomStatus,
  TypeCardRank,
  TypeCardSuit,
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
    const room = this.rooms.get(roomId) ?? null;

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
    const { playerId } = data;

    const hostPlayer = new Player(socket, playerId, TypePlayerMember.Host);

    let roomId = '';

    do {
      roomId = generateRoomId();
    } while (this.rooms.has(roomId));

    socket.join(roomId);

    const room = new Room(roomId, hostPlayer, this);

    this.rooms.set(roomId, room);

    return this.createResponseObject({
      roomId,
      hostPlayerId: playerId,
      roomStatus: room.getRoomStatus(),
      players: room.getPlayersAsDto(),
    });
  }

  /**
   * Join player to room
   * @param {GameReceiveDto} data
   * @param {Socket} socket
   * @returns {void}
   */
  public joinRoom(data: GameReceiveDto, socket: Socket) {
    const { roomId, playerId } = data;

    const room = this.rooms.get(roomId);

    const payload = {
      roomId: roomId,
      playerId: playerId,
    };

    if (!room) {
      return this.createResponseObject({
        ...payload,
        error: TypeGameError.JoinRoomFailed,
      });
    }

    const player = new Player(socket, data.playerId, TypePlayerMember.Regular);

    socket.join(room.getRoomId());

    if (room.joinRoom(player) === false) {
      return this.createResponseObject({
        ...payload,
        error: TypeGameError.JoinRoomFailed,
      });
    }

    return this.createResponseObject(payload);
  }

  public getRoomState(client: Socket): TypeServerResponse {
    let roomId = '',
      playerId = '';

    loop1: for (const [key, room] of this.rooms.entries()) {
      const players = room.getPlayers();

      for (const player of players) {
        if (player.socket === client) {
          roomId = room.getRoomId();
          playerId = key;
          break loop1;
        }
      }
    }

    return this.createResponseObject({
      roomId,
      playerId,
    });
  }

  private getRoomData(roomId: string): TypeServerResponse {
    if (!this.rooms.has(roomId)) {
      return {};
    }

    const room = this.rooms.get(roomId);

    if (room) {
      return {
        roomId: room.roomId,
        roomStatus: room.roomStatus,
        hostPlayerId: room.getHostPlayer().getPlayerId(),
        activePlayerId: room.getHostPlayerId(),
        players: room.players.getPlayersAsDto(),
        trumpCard: room.getDeck().getTrumpCard().getCardDto(),
        placedCards: [],
        dealt: [],
        deckCounter: room.getDeck().size,
        error: '',
      };
    }

    return {};
  }

  /**
   * Returns response object
   * @param {Partial<TypeServerResponse>} payload
   * @returns {TypeServerResponse}
   */
  private createResponseObject(
    payload: TypeServerResponse,
  ): TypeServerResponse {
    let initialState: TypeServerResponse = {
      roomId: '',
      roomStatus: TypeRoomStatus.WaitingForPlayers,
      hostPlayerId: '',
      activePlayerId: '',
      players: [],
      trumpCard: {
        rank: TypeCardRank.RANK_6,
        suit: TypeCardSuit.Clubs,
      },
      placedCards: [],
      dealt: [],
      deckCounter: 0,
      error: '',
    };

    if (payload.roomId) {
      initialState = this.getRoomData(payload.roomId);
    }

    return { ...initialState, ...payload };
  }

  // async setFromClientCreatePlayer(data: GameReceiveDto) {
  //   console.log('setCreatePlayer', data);
  // }

  // async setFromClientChatMessage(data: GameReceiveDto, socket: Socket) {
  //   const room = this.rooms.get(data.roomId);
  //   if (!room) {
  //     return false;
  //   }

  //   const player = room.getPlayers().getById(data.playerId);
  //   if (!player) {
  //     return false;
  //   }

  //   if (socket.id !== player.getSocketId()) {
  //     return false;
  //   }

  //   const message: GameSendDto = {
  //     source: player.getPlayerId(),
  //     timestamp: Date.now(),
  //     chatMessage: data.chatMessage,
  //   };

  //   socket
  //     .to(room.getRoomId())
  //     .emit(TypeRoomEvent.gameFromServerChatMessage, { data: message });
  // }

  // /**
  //  * Join player to room
  //  * @param {GameReceiveDto} data
  //  * @param {Socket} socket
  //  * @returns {void}
  //  */
  // async setFromClientJoinRoom(
  //   data: GameReceiveDto,
  //   socket: Socket,
  // ): Promise<void> {
  //   const room = this.rooms.get(data.roomId);
  //   if (!room) {
  //     const payload = {
  //       roomId: data.roomId,
  //       socket: socket,
  //       playerId: data.playerId,
  //     };

  //     this.setFromServerError(TypeServerError.JoinRoomFailed, payload);

  //     return;
  //   }

  //   const player = new Player(socket, data.playerId, TypePlayerMember.Regular);

  //   socket.join(room.getRoomId());

  //   room.joinRoom(player);
  // }

  // async setFromClientLeaveRoom(data: GameReceiveDto, socket: Socket) {
  //   console.log('setLeaveRoom', data);
  //   const room = this.rooms.get(data.roomId);
  //   if (!room) {
  //     return false;
  //   }

  //   const player = room.getPlayers().getById(data.playerId);
  //   if (!player) {
  //     return false;
  //   }
  //   if (socket.id !== player.getSocketId()) {
  //     return false;
  //   }

  //   socket.leave(room.getRoomId());

  //   room.leaveRoom(data.playerId);
  // }

  // async setFromClientStartGame(data: GameReceiveDto, socketId: string) {
  //   console.log('setStartGame', data);
  //   const room = this.rooms.get(data.roomId);
  //   if (!room || socketId !== room.getHostPlayer().getSocketId()) {
  //     return false;
  //   }
  //   room.start();
  // }

  // async setFromClientAttackerOpen(data: GameReceiveDto) {
  //   console.log('setAttackerOpen', data);
  // }

  // async setFromClientAttackerPass(data: GameReceiveDto) {
  //   console.log('setAttackerPass', data);
  // }

  // async setFromClientDefenderClose(data: GameReceiveDto) {
  //   console.log('setDefenderClose', data);
  // }

  // async setFromClientDefenderTake(data: GameReceiveDto) {
  //   console.log('setDefenderTake', data);
  // }

  // async setFromClientSettings(data: GameReceiveDto) {
  //   console.log('setSettings', data);
  // }

  // async setFromClientRestartGame(data: GameReceiveDto, socketId: string) {
  //   console.log('setFromClientRestartGame', data);
  //   const room = this.rooms.get(data.roomId);
  //   if (!room || socketId !== room.getHostPlayer().getSocketId()) {
  //     return false;
  //   }
  //   room.restartGame();
  // }

  // async setFromClientOpenRoom(data: GameReceiveDto, socketId: string) {
  //   console.log('setFromClientOpenRoom');
  //   const room = this.rooms.get(data.roomId);
  //   if (
  //     !room ||
  //     room.getPlayersCount() === MAX_NUMBER_OF_PLAYERS ||
  //     socketId !== room.getHostPlayer().getSocketId()
  //   ) {
  //     return false;
  //   }
  //   room.openRoom();
  // }

  // /** Emit event gameFromServerRoomStatusChange to client
  //  * Type: Broadcast
  //  *
  //  * Sends data: {
  //  *   roomId: string;
  //  *   roomStatus: TypeRoomStatus
  //  * }
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerRoomStatusChange(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerRoomStatusChange, payload);
  // }

  // /**
  //  * Emit event gameFromServerJoinRoomSuccess to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerJoinRoomSuccess(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerJoinRoomSuccess, payload);
  // }

  // /**
  //  * Emit event gameFromServerLeaveRoomSuccess to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerLeaveRoomSuccess(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   const room = this.getRoomById(payload.roomId);

  //   if (room && room.getPlayersCount() === 0) {
  //     this.closeRoomById(payload.roomId);
  //   }

  //   this.emitEvent(TypeRoomEvent.gameFromServerLeaveRoomSuccess, payload);
  // }

  // async setFromServerDealtCardsToPlayers(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerDealtCardsToPlayers, payload);
  // }

  // /**
  //  * Emit event gameFromServerAttackerSetActive to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerAttackerSetActive(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerAttackerSetActive, payload);
  // }

  // /**
  //  * Emit event gameFromServerAttackerOpenSuccess to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerAttackerOpenSuccess(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerAttackerOpenSuccess, payload);
  // }

  // /**
  //  * Emit event gameFromServerAttackerPass to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerAttackerPass(payload: TypeServerResponse): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerAttackerPass, payload);
  // }

  // /**
  //  * Emit event gameFromServerDefenderSetActive to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerDefenderSetActive(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerDefenderSetActive, payload);
  // }

  // /**
  //  * Emit event gameFromServerDefenderCloseSuccess to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerDefenderCloseSuccess(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerDefenderCloseSuccess, payload);
  // }

  // /**
  //  * Emit event gameFromServerSendPlayerStatus to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerSendPlayerStatus(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerSendPlayerStatus, payload);
  // }

  // /**
  //  * Emit event gameFromServerDefenderPickUpCards to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerDefenderPickUpCards(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerDefenderPickUpCards, payload);
  // }

  // async setFromServerError(
  //   errorType: TypeServerError,
  //   payload: TypeServerResponse,
  // ) {
  //   this.emitEvent(TypeRoomEvent.gameFromServerError, {
  //     ...payload,
  //     errorType,
  //   });
  // }

  // /**
  //  * Send data to client
  //  * @param {TypeRoomEvent} type Type of  gameFromServer* event
  //  * @param {TypeServerResponse} payload Data for sending to client
  //  */
  // async emitEvent(
  //   type: TypeRoomEvent,
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   let adapter: Server | Socket = this.server;

  //   const { socket, ...data } = payload;

  //   if (socket) {
  //     adapter = socket;
  //   }

  //   adapter.to(payload.roomId).emit(type, {
  //     data: {
  //       ...data,
  //     },
  //   });
  // }
}
