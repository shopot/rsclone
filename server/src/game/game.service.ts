import { Injectable } from '@nestjs/common';
import { Player } from '../shared/libs/Player';
import { TypePlayerMember, TypeGameResponse } from '../shared/types';
import { generateRoomName } from '../shared/utils/generateRoomName';
import { IGameService } from '../shared/interfaces';
import { Room } from '../shared/libs/Room';
import { GameReceiveDto, RoomDto } from './dto';

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

  async setFromClientCreateRoom(data: GameReceiveDto, socketId: string) {
    const hostPlayer = new Player(
      socketId,
      data.playerId,
      TypePlayerMember.Host,
    );

    const roomId = generateRoomName();

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

  async setFromClientChatMessage(data: GameReceiveDto) {
    console.log('setChatMessage', data);
  }

  async setFromClientJoinRoom(data: GameReceiveDto, socketId: string) {
    const room = this.rooms.get(data.roomId);
    if (!room) {
      const payload = {
        roomId: data.roomId,
        socketId: socketId,
        playerId: data.playerId,
      };
      this.setFromServerJoinRoomFail(payload);
      return false;
    }

    const player = new Player(
      socketId,
      data.playerId,
      TypePlayerMember.Regular,
    );

    room.joinRoom(player);
  }

  async setFromClientLeaveRoom(data: GameReceiveDto) {
    console.log('setLeaveRoom', data);
    const room = this.rooms.get(data.roomId);
    if (!room) {
      return false;
    }
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
