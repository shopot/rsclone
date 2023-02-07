import { CardDto } from './../shared/dto/card.dto';
import { TypeGameError } from './../shared/types/TypeGameError';
import { TypeRoomList } from './../shared/types/TypeRoomList';
import {
  TypePlayerMember,
  TypeServerResponse,
  TypeRoomStatus,
  TypeCardRank,
  TypeCardSuit,
  TypeCardDto,
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
    const { playerName } = data;

    const hostPlayer = new Player(socket, playerName, TypePlayerMember.Host);

    let roomId = '';

    do {
      roomId = generateRoomId();
    } while (this.rooms.has(roomId));

    socket.join(roomId);

    const room = new Room(roomId, hostPlayer, this);

    this.rooms.set(roomId, room);

    return this.createResponseObject({
      roomId,
      hostSocketId: socket.id,
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

    socket.join(room.getRoomId());

    if (room.joinRoom(player) === false) {
      return this.createResponseObject({
        roomId,
        error: TypeGameError.JoinRoomFailed,
      });
    }

    return this.createResponseObject({ roomId });
  }

  public setLeaveRoom(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    const room = this.getRoomById(roomId);

    if (!room) {
      return this.createResponseObject({
        roomId,
        error: TypeGameError.JoinRoomFailed,
      });
    }

    client.leave(roomId);

    room.leaveRoom(client.id);

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

  public setCardOpen(client: Socket, card: TypeCardDto): TypeServerResponse {
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

  public setCardClose(client: Socket, card: TypeCardDto): TypeServerResponse {
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

  public getRoomState(client: Socket): TypeServerResponse {
    const roomId = this.getRoomIdByClientSocket(client);

    return this.createResponseObject({ roomId });
  }

  private getRoomIdByClientSocket(client: Socket) {
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

    let room: Room | undefined;

    if (roomId && this.rooms.has(roomId)) {
      room = this.rooms.get(roomId);
    }

    const initialState: TypeServerResponse = {
      roomId: room?.roomId || '',
      roomStatus: room?.roomStatus || TypeRoomStatus.WaitingForPlayers,
      hostSocketId: room?.hostPlayer.getSocketId() || '',
      activeSocketId: room?.activePlayer.getSocketId() || '',
      players: room?.players.getPlayersAsDto() || [],
      trumpCard: room?.getDeck().getTrumpCard().getCardDto() || {
        rank: TypeCardRank.RANK_6,
        suit: TypeCardSuit.Clubs,
      },
      placedCards: room?.getPlacedCards() || [],
      dealt: [],
      deckCounter: room?.getDeck().size || 0,
      error: '',
    };

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

  //   const player = room.getPlayers().getById(data.socketId);
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
  //  * Emit event gameFromServerDefenderPickUpCards to client
  //  * @param {TypeServerResponse} payload Data for client sending
  //  */
  // async setFromServerDefenderPickUpCards(
  //   payload: TypeServerResponse,
  // ): Promise<void> {
  //   this.emitEvent(TypeRoomEvent.gameFromServerDefenderPickUpCards, payload);
  // }
}
