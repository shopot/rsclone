import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import {
  TypeRoomEvent,
  TypeRoomList,
  TypeServerResponse,
} from '../shared/types';
import { GameReceiveDto } from './dto';
import { GameService } from './game.service';

@Injectable()
@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayInit, OnGatewayDisconnect {
  constructor(private gameService: GameService) {}

  @WebSocketServer()
  public server: Server;

  handleConnection(client: Socket) {
    Logger.debug(`Client connect ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    Logger.debug(`Client disconnect  ${client.id}`);
  }

  afterInit(server: Server) {
    this.gameService.server = server;
  }

  /**
   * Send rooms list to client
   */
  @SubscribeMessage(TypeRoomEvent.GameRooms)
  handleGetRooms(): void {
    const results = this.gameService.getRooms();

    this.emitEvent(TypeRoomEvent.GameRooms, results);
  }

  /**
   * Create room event
   * @param {GameReceiveDto} data
   * @param {Socket} client
   * @returns
   */
  @SubscribeMessage(TypeRoomEvent.GameCreateRoom)
  handleCreateRoom(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const results = this.gameService.createRoom(data, client);

    this.emitEvent(TypeRoomEvent.GameCreateRoom, results, client);
  }

  /**
   * Join to room
   * @param {GameReceiveDto} data
   */
  @SubscribeMessage(TypeRoomEvent.GameJoinRoom)
  handleFromClientJoinRoom(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const results = this.gameService.joinRoom(data, client);

    this.emitEvent(TypeRoomEvent.GameJoinRoom, results, client);
  }

  // @SubscribeMessage(TypeRoomEvent.GameLeaveRoom)
  // handleFromClientLeaveRoom(
  //   @MessageBody('data') data: GameReceiveDto,
  //   @ConnectedSocket() client: Socket,
  // ): void {
  //   this.gameService.setFromClientLeaveRoom(data, client);
  // }

  /**
   * Emit event, send data to client
   * @param {TypeRoomEvent} type
   * @param {TypeServerResponse} payload
   */
  private emitEvent(
    type: TypeRoomEvent,
    payload: TypeServerResponse | TypeRoomList,
    client: Socket | null = null,
  ): void {
    const response = { data: payload };

    Logger.debug(type);
    Logger.debug(response);

    if (client !== null) {
      client.emit(type, response);
    } else {
      this.server.emit(type, response);
    }
  }
}
