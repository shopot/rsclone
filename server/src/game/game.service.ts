import { Injectable } from '@nestjs/common';
import { GameReceiveDto } from './dto';

@Injectable()
export class GameService {
  async setFromClientCreatePlayer(data: GameReceiveDto) {
    console.log('setCreatePlayer', data);
  }

  async setFromClientChatMessage(data: GameReceiveDto) {
    console.log('setChatMessage', data);
  }

  async setFromClientJoinRoom(data: GameReceiveDto) {
    console.log('setJoinRoom', data);
  }

  async setFromClientLeaveRoom(data: GameReceiveDto) {
    console.log('setLeaveRoom', data);
  }

  async setFromClientStartGame(data: GameReceiveDto) {
    console.log('setStartGame', data);
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
}
