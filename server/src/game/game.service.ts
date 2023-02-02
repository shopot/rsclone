import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  ChatMessageDto,
  JoinRoomDto,
  LeaveRoomDto,
  StartGameDto,
  AttackerOpenDto,
  AttackerPassDto,
  DefenderCloseDto,
  DefenderTakeDto,
  SettingsDto,
} from './dto';

@Injectable()
export class GameService {
  async setCreatePlayer(data: CreateUserDto) {
    console.log('setCreatePlayer', data);
  }

  async setChatMessage(data: ChatMessageDto) {
    console.log('setChatMessage', data);
  }

  async setJoinRoom(data: JoinRoomDto) {
    console.log('setJoinRoom', data);
  }

  async setLeaveRoom(data: LeaveRoomDto) {
    console.log('setLeaveRoom', data);
  }

  async setStartGame(data: StartGameDto) {
    console.log('setStartGame', data);
  }

  async setAttackerOpen(data: AttackerOpenDto) {
    console.log('setAttackerOpen', data);
  }

  async setAttackerPass(data: AttackerPassDto) {
    console.log('setAttackerPass', data);
  }

  async setDefenderClose(data: DefenderCloseDto) {
    console.log('setDefenderClose', data);
  }

  async setDefenderTake(data: DefenderTakeDto) {
    console.log('setDefenderTake', data);
  }

  async setSettings(data: SettingsDto) {
    console.log('setSettings', data);
  }
}
