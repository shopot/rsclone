import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
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
import { Server } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: true })
export class GameGateway {
  constructor(private gameService: GameService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('gameFromClientCreatePlayer')
  handleFromClientCreatePlayer(@MessageBody('data') data: CreateUserDto): void {
    Logger.debug('gameFromClientCreatePlayer');
    this.gameService.setFromClientCreatePlayer(data);
  }

  @SubscribeMessage('gameFromClientChatMessage')
  handleFromClientChatMessage(@MessageBody('data') data: ChatMessageDto): void {
    Logger.debug('gameFromClientChatMessage');
    this.gameService.setFromClientChatMessage(data);
  }

  @SubscribeMessage('gameFromClientJoinRoom')
  handleFromClientJoinRoom(@MessageBody('data') data: JoinRoomDto): void {
    Logger.debug('gameFromClientJoinRoom');
    this.gameService.setFromClientJoinRoom(data);
  }

  @SubscribeMessage('gameFromClientLeaveRoom')
  handleFromClientLeaveRoom(@MessageBody('data') data: LeaveRoomDto): void {
    Logger.debug('gameFromClientLeaveRoom');
    this.gameService.setFromClientLeaveRoom(data);
  }

  @SubscribeMessage('gameFromClientStartGame')
  handleFromClientStartGame(@MessageBody('data') data: StartGameDto): void {
    Logger.debug('gameFromClientStartGame');
    this.gameService.setFromClientStartGame(data);
  }

  @SubscribeMessage('gameFromClientAttackerOpen')
  handleFromClientAttackerOpen(
    @MessageBody('data') data: AttackerOpenDto,
  ): void {
    Logger.debug('gameFromClientAttackerOpen');
    this.gameService.setFromClientAttackerOpen(data);
  }

  @SubscribeMessage('gameFromClientAttackerPass')
  handleFromClientAttackerPass(
    @MessageBody('data') data: AttackerPassDto,
  ): void {
    Logger.debug('gameFromClientAttackerPass');
    this.gameService.setFromClientAttackerPass(data);
  }

  @SubscribeMessage('gameFromClientDefenderClose')
  handleFromClientDefenderClose(
    @MessageBody('data') data: DefenderCloseDto,
  ): void {
    Logger.debug('gameFromClientDefenderClose');
    this.gameService.setFromClientDefenderClose(data);
  }

  @SubscribeMessage('gameFromClientDefenderTake')
  handleFromClientDefenderTake(
    @MessageBody('data') data: DefenderTakeDto,
  ): void {
    Logger.debug('gameFromClientDefenderTake');
    this.gameService.setFromClientDefenderTake(data);
  }

  @SubscribeMessage('gameFromClientSettings')
  handleFromClientSettings(@MessageBody('data') data: SettingsDto): void {
    Logger.debug('gameFromClientSettings');
    this.gameService.setFromClientSettings(data);
  }
}
