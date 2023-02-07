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
   * Send room state to client
   */
  @SubscribeMessage(TypeRoomEvent.GameUpdateState)
  handleGameUpdateState(@ConnectedSocket() client: Socket): void {
    this.sendStateToClient(client);
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
  handleGameCreateRoom(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const results = this.gameService.createRoom(data, client);

    this.emitEvent(TypeRoomEvent.GameCreateRoom, results, client);

    this.handleGetRooms();
  }

  /**
   * Join to room
   * @param {GameReceiveDto} data
   * @param {Socket} client
   */
  @SubscribeMessage(TypeRoomEvent.GameJoinRoom)
  handleGameJoinRoom(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const results = this.gameService.joinRoom(data, client);

    this.emitEvent(TypeRoomEvent.GameJoinRoom, results, client);

    this.handleGetRooms();
  }

  /**
   * Player leave room
   * @param {Socket} client
   */
  @SubscribeMessage(TypeRoomEvent.GameLeaveRoom)
  handleGameLeaveRoom(@ConnectedSocket() client: Socket): void {
    const results = this.gameService.setLeaveRoom(client);

    if (results !== null) {
      this.sendStateToClient(client, results);
    }

    this.handleGetRooms();
  }

  /**
   * Start game
   * @param {GameReceiveDto} data
   */
  @SubscribeMessage(TypeRoomEvent.GameStart)
  handleGameStart(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const results = this.gameService.startGame(client);

    this.sendStateToClient(client, results);
  }

  /**
   * Open Card by attacker
   * @param {GameReceiveDto} data
   */
  @SubscribeMessage(TypeRoomEvent.GameCardOpen)
  handleGameCardOpen(
    @MessageBody('data') { card }: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const results = this.gameService.setCardOpen(client, card);

    this.sendStateToClient(client, results);
  }

  /**
   * Close card by defender
   * @param {GameReceiveDto} data
   */
  @SubscribeMessage(TypeRoomEvent.GameCardClose)
  handleGameCardClose(
    @MessageBody('data') { card }: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const results = this.gameService.setCardClose(client, card);

    this.sendStateToClient(client, results);
  }

  @SubscribeMessage(TypeRoomEvent.GameAttackerPass)
  handlerGameAttackerPass(@ConnectedSocket() client: Socket): void {
    const results = this.gameService.setAttackerPass(client);

    this.sendStateToClient(client, results);
  }

  /**
   * Send state to client by roomId
   * @param {Socket} client
   */
  private sendStateToClient(
    client: Socket,
    payload: TypeServerResponse | null = null,
  ) {
    const results = this.gameService.getRoomState(client);

    const { roomId } = results;

    // Send to all client by roomId
    if (roomId) {
      const response = {
        data: { ...results, ...(payload || {}) },
      };

      this.server.to(roomId).emit(TypeRoomEvent.GameUpdateState, response);

      Logger.debug(TypeRoomEvent.GameUpdateState);
      Logger.debug(response);
    }
  }

  private emitToRoom(
    roomId: string,
    type: TypeRoomEvent,
    payload: TypeServerResponse,
  ): void {
    this.server.to(roomId).emit(type, { data: payload });
  }

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
