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

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    this.server.emit('message', message);
    console.log(message);
  }

  @SubscribeMessage('gameFromClientCreatePlayer')
  handleCreatePlayer(@MessageBody('data') data: CreateUserDto): void {
    Logger.debug('gameFromClientCreatePlayer');
    this.gameService.setCreatePlayer(data);
  }

  @SubscribeMessage('gameFromClientChatMessage')
  handleChatMessage(@MessageBody('data') data: ChatMessageDto): void {
    Logger.debug('gameFromClientChatMessage');
    this.gameService.setChatMessage(data);
  }

  @SubscribeMessage('gameFromClientJoinRoom')
  handleJoinRoom(@MessageBody('data') data: JoinRoomDto): void {
    Logger.debug('gameFromClientJoinRoom');
    this.gameService.setJoinRoom(data);
  }

  @SubscribeMessage('gameFromClientLeaveRoom')
  handleLeaveRoom(@MessageBody('data') data: LeaveRoomDto): void {
    Logger.debug('gameFromClientLeaveRoom');
    this.gameService.setLeaveRoom(data);
  }

  @SubscribeMessage('gameFromClientStartGame')
  handleStartGame(@MessageBody('data') data: StartGameDto): void {
    Logger.debug('gameFromClientStartGame');
    this.gameService.setStartGame(data);
  }

  @SubscribeMessage('gameFromClientAttackerOpen')
  handleAttackerOpen(@MessageBody('data') data: AttackerOpenDto): void {
    Logger.debug('gameFromClientAttackerOpen');
    this.gameService.setAttackerOpen(data);
  }

  @SubscribeMessage('gameFromClientAttackerPass')
  handleAttackerPass(@MessageBody('data') data: AttackerPassDto): void {
    Logger.debug('gameFromClientAttackerPass');
    this.gameService.setAttackerPass(data);
  }

  @SubscribeMessage('gameFromClientDefenderClose')
  handleDefenderClose(@MessageBody('data') data: DefenderCloseDto): void {
    Logger.debug('gameFromClientDefenderClose');
    this.gameService.setDefenderClose(data);
  }

  @SubscribeMessage('gameFromClientDefenderTake')
  handleDefenderTake(@MessageBody('data') data: DefenderTakeDto): void {
    Logger.debug('gameFromClientDefenderTake');
    this.gameService.setDefenderTake(data);
  }

  @SubscribeMessage('gameFromClientSettings')
  handleSettings(@MessageBody('data') data: SettingsDto): void {
    Logger.debug('gameFromClientSettings');
    this.gameService.setSettings(data);
  }
}
