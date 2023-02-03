import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Player } from '../shared/libs/Player';
import {
  TypePlayerMember,
  TypeGameResponse,
  TypeRoomEvent,
} from '../shared/types';
import { generateRoomName } from '../shared/utils/generateRoomName';
import { IGameService } from '../shared/interfaces';
import { Room } from '../shared/libs/Room';
import { GameReceiveDto, GameSendDto, RoomDto } from './dto';

@Injectable()
export class GameService implements IGameService {
  private rooms: Map<string, Room>;

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
    const hostPlayer = new Player(
      socket.id,
      data.playerId,
      TypePlayerMember.Host,
    );

    const roomId = generateRoomName();
    socket.join(roomId);

    const room = new Room(roomId, hostPlayer, this);

    this.rooms.set(roomId, room);

    console.log(room);
    // Send to client message: Game is created
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
        socketId: socket.id,
        playerId: data.playerId,
      };
      this.setFromServerJoinRoomFail(payload);
      return false;
    }

    const player = new Player(
      socket.id,
      data.playerId,
      TypePlayerMember.Regular,
    );

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

  async setFromServerGameStart(payload?: TypeGameResponse): Promise<void> {
    console.log('interface');
  }

  async setFromServerGameOver(payload?: TypeGameResponse): Promise<void> {
    console.log('interface');
  }

  async setFromServerJoinRoomSuccess(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }

  async setFromServerJoinRoomFail(payload?: TypeGameResponse): Promise<void> {
    console.log('interface');
  }

  async setFromServerLeaveRoomSuccess(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }

  async setFromServerGameWaitingForStart(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }

  async setFromServerAttackerSetActive(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }
  async setFromServerAttackerOpenSuccess(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }
  async setFromServerAttackerOpenFail(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }
  async setFromServerAttackerPass(payload?: TypeGameResponse): Promise<void> {
    console.log('interface');
  }

  async setFromServerDefenderSetActive(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }

  async setFromServerDefenderCloseSuccess(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }

  async setFromServerDefenderCloseFail(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }

  async setFromServerSendPlayerStatus(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }

  async setFromServerDefenderPickUpCards(
    payload?: TypeGameResponse,
  ): Promise<void> {
    console.log('interface');
  }
}
