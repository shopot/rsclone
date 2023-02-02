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
  async setFromClientCreatePlayer(data: CreateUserDto) {
    console.log('setCreatePlayer', data);
  }

  async setFromClientChatMessage(data: ChatMessageDto) {
    console.log('setChatMessage', data);
  }

  async setFromClientJoinRoom(data: JoinRoomDto) {
    console.log('setJoinRoom', data);
  }

  async setFromClientLeaveRoom(data: LeaveRoomDto) {
    console.log('setLeaveRoom', data);
  }

  async setFromClientStartGame(data: StartGameDto) {
    console.log('setStartGame', data);
  }

  async setFromClientAttackerOpen(data: AttackerOpenDto) {
    console.log('setAttackerOpen', data);
  }

  async setFromClientAttackerPass(data: AttackerPassDto) {
    console.log('setAttackerPass', data);
  }

  async setFromClientDefenderClose(data: DefenderCloseDto) {
    console.log('setDefenderClose', data);
  }

  async setFromClientDefenderTake(data: DefenderTakeDto) {
    console.log('setDefenderTake', data);
  }

  async setFromClientSettings(data: SettingsDto) {
    console.log('setSettings', data);
  }
}
