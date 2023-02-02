import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameReceiveDto } from './dto';
import { Server } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: true })
export class GameGateway {
  constructor(private gameService: GameService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('gameFromClientCreatePlayer')
  handleFromClientCreatePlayer(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientCreatePlayer');
    this.gameService.setFromClientCreatePlayer(data);
  }

  @SubscribeMessage('gameFromClientChatMessage')
  handleFromClientChatMessage(@MessageBody('data') data: GameReceiveDto): void {
    Logger.debug('gameFromClientChatMessage');
    this.gameService.setFromClientChatMessage(data);
  }

  @SubscribeMessage('gameFromClientJoinRoom')
  handleFromClientJoinRoom(@MessageBody('data') data: GameReceiveDto): void {
    Logger.debug('gameFromClientJoinRoom');
    this.gameService.setFromClientJoinRoom(data);
  }

  @SubscribeMessage('gameFromClientLeaveRoom')
  handleFromClientLeaveRoom(@MessageBody('data') data: GameReceiveDto): void {
    Logger.debug('gameFromClientLeaveRoom');
    this.gameService.setFromClientLeaveRoom(data);
  }

  @SubscribeMessage('gameFromClientStartGame')
  handleFromClientStartGame(@MessageBody('data') data: GameReceiveDto): void {
    Logger.debug('gameFromClientStartGame');
    this.gameService.setFromClientStartGame(data);
  }

  @SubscribeMessage('gameFromClientAttackerOpen')
  handleFromClientAttackerOpen(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientAttackerOpen');
    this.gameService.setFromClientAttackerOpen(data);
  }

  @SubscribeMessage('gameFromClientAttackerPass')
  handleFromClientAttackerPass(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientAttackerPass');
    this.gameService.setFromClientAttackerPass(data);
  }

  @SubscribeMessage('gameFromClientDefenderClose')
  handleFromClientDefenderClose(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientDefenderClose');
    this.gameService.setFromClientDefenderClose(data);
  }

  @SubscribeMessage('gameFromClientDefenderTake')
  handleFromClientDefenderTake(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientDefenderTake');
    this.gameService.setFromClientDefenderTake(data);
  }

  @SubscribeMessage('gameFromClientSettings')
  handleFromClientSettings(@MessageBody('data') data: GameReceiveDto): void {
    Logger.debug('gameFromClientSettings');
    this.gameService.setFromClientSettings(data);
  }
}
