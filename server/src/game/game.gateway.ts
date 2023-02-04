import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TypeRoomEvent } from '../shared/types/TypeRoomEvent';
import { GameReceiveDto } from './dto';
import { Server } from 'socket.io';
import { GameService } from './game.service';

@Injectable()
@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayInit {
  constructor(private gameService: GameService) {}

  @WebSocketServer()
  public server: Server;

  afterInit(server: Server) {
    this.gameService.server = server;
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientCreatePlayer)
  handleFromClientCreatePlayer(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientCreatePlayer');
    this.gameService.setFromClientCreatePlayer(data);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientChatMessage)
  handleFromClientChatMessage(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.debug('gameFromClientChatMessage');
    this.gameService.setFromClientChatMessage(data, client);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientCreateRoom)
  handleFromClientCreateRoom(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.debug('gameFromClientCreateRoom');
    this.gameService.setFromClientCreateRoom(data, client);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientGetRooms)
  handleFromClientGetRooms(@MessageBody('data') data: GameReceiveDto): void {
    Logger.debug('gameFromClientGetRooms');
    this.gameService.setFromClientGetRooms(data).then((results) => {
      this.server.emit('gameFromServerGetRooms', results);
    });
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientJoinRoom)
  handleFromClientJoinRoom(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.debug('gameFromClientJoinRoom');
    this.gameService.setFromClientJoinRoom(data, client);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientLeaveRoom)
  handleFromClientLeaveRoom(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.debug('gameFromClientLeaveRoom');
    this.gameService.setFromClientLeaveRoom(data, client);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientStartGame)
  handleFromClientStartGame(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.debug('gameFromClientStartGame');
    this.gameService.setFromClientStartGame(data, client.id);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientAttackerOpen)
  handleFromClientAttackerOpen(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientAttackerOpen');
    this.gameService.setFromClientAttackerOpen(data);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientAttackerPass)
  handleFromClientAttackerPass(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientAttackerPass');
    this.gameService.setFromClientAttackerPass(data);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientDefenderClose)
  handleFromClientDefenderClose(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientDefenderClose');
    this.gameService.setFromClientDefenderClose(data);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientDefenderTake)
  handleFromClientDefenderTake(
    @MessageBody('data') data: GameReceiveDto,
  ): void {
    Logger.debug('gameFromClientDefenderTake');
    this.gameService.setFromClientDefenderTake(data);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientSettings)
  handleFromClientSettings(@MessageBody('data') data: GameReceiveDto): void {
    Logger.debug('gameFromClientSettings');
    this.gameService.setFromClientSettings(data);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientRestartGame)
  handleFromClientRestartGame(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.debug('gameFromClientRestartGame');
    this.gameService.setFromClientRestartGame(data, client.id);
  }

  @SubscribeMessage(TypeRoomEvent.gameFromClientOpenRoom)
  handleFromClientOpenRoom(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.debug('gameFromClientOpenRoom');
    this.gameService.setFromClientOpenRoom(data, client.id);
  }
}
