import { Inject, Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Socket, Server } from 'socket.io';
import { Logger as WinstonLogger } from 'winston';
import {
  TypeRoomEvent,
  TypeRoomList,
  TypeServerResponse,
  TypeChatMessage,
} from '../../shared/types';
import { GameReceiveDto, RoomCreateDto, RoomJoinDto } from './dto';
import { GameService } from './game.service';

@Injectable()
@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayInit, OnGatewayDisconnect {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
    private gameService: GameService,
  ) {}

  @WebSocketServer()
  public server: Server;

  handleConnection(client: Socket) {
    this.logger.info(`Client connect ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    if (this.gameService.hasPlayerInRoomByClientSocket(client)) {
      this.handleGameLeaveRoom(client);
    }

    this.logger.info(`Client disconnect  ${client.id}`);
  }

  afterInit(server: Server) {
    this.gameService.server = server;
  }

  /**
   * Send room state to client
   */
  @SubscribeMessage(TypeRoomEvent.GameUpdateState)
  handleGameUpdateState(@ConnectedSocket() client: Socket): void {
    this.sendStateToClientByClientSocket(client);
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
   * @param {RoomCreateDto} data - receive userId and testCaseName
   * @param {Socket} client
   * @returns
   */
  @SubscribeMessage(TypeRoomEvent.GameCreateRoom)
  async handleGameCreateRoom(
    @MessageBody('data') data: RoomCreateDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const results = await this.gameService.createRoom(data, client);

    this.emitEvent(TypeRoomEvent.GameCreateRoom, results, client);

    this.handleGetRooms();
    this.handleGameUpdateState(client);
  }

  /**
   * Join to room
   * @param {GameReceiveDto} data
   * @param {Socket} client
   */
  @SubscribeMessage(TypeRoomEvent.GameJoinRoom)
  async handleGameJoinRoom(
    @MessageBody('data') data: RoomJoinDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const results = await this.gameService.joinRoom(data, client);

    this.emitEvent(TypeRoomEvent.GameJoinRoom, results, client);

    this.handleGetRooms();
    this.handleGameUpdateState(client);
  }

  /**
   * Player leave room
   * @param {Socket} client
   */
  @SubscribeMessage(TypeRoomEvent.GameLeaveRoom)
  handleGameLeaveRoom(@ConnectedSocket() client: Socket): void {
    const results = this.gameService.setLeaveRoom(client);

    if (results !== null) {
      const { roomId } = results;
      this.sendStateToClientByRoomId(roomId, results);
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

    this.sendStateToClientByClientSocket(client, results);
  }

  /**
   * Restart game
   * @param {GameReceiveDto} data
   */
  @SubscribeMessage(TypeRoomEvent.GameRestartGame)
  handleGameRestart(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const results = this.gameService.setGameRestart(client);

    this.handleGetRooms();
    this.sendStateToClientByClientSocket(client, results);
  }

  /**
   * Open room
   * @param {GameReceiveDto} data
   */
  @SubscribeMessage(TypeRoomEvent.GameOpenRoom)
  handleOpenRoom(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const results = this.gameService.setRoomOpen(client);

    this.handleGetRooms();
    this.sendStateToClientByClientSocket(client, results);
  }

  /**
   * Chat message
   * @param {GameReceiveDto} data
   */
  @SubscribeMessage(TypeRoomEvent.GameChatMessage)
  handleChatMessage(
    @MessageBody('data') data: GameReceiveDto,
    @ConnectedSocket() client: Socket,
  ): void {
    const chatState = this.gameService.setChatMessage(data, client);

    this.sendChatState(chatState);
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

    this.sendStateToClientByClientSocket(client, results);
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

    this.sendStateToClientByClientSocket(client, results);
  }

  @SubscribeMessage(TypeRoomEvent.GameAttackerPass)
  handlerGameAttackerPass(@ConnectedSocket() client: Socket): void {
    const results = this.gameService.setAttackerPass(client);

    this.sendStateToClientByClientSocket(client, results);
  }

  @SubscribeMessage(TypeRoomEvent.GamePickUpCards)
  handlerGamePickUpCards(@ConnectedSocket() client: Socket): void {
    const results = this.gameService.setDefenderPickUpCards(client);

    this.sendStateToClientByClientSocket(client, results);
  }

  private sendStateToClientByClientSocket(
    client: Socket,
    payload: TypeServerResponse | null = null,
  ): void {
    const roomId = this.gameService.getRoomIdByClientSocket(client);

    return this.sendStateToClientByRoomId(roomId, payload);
  }

  /**
   * Send state to client by roomId
   * @param {Socket} client
   */
  private sendStateToClientByRoomId(
    roomId: string,
    payload: TypeServerResponse | null = null,
  ): void {
    // Send to all client by roomId
    if (roomId) {
      const roomState = this.gameService.getRoomState(roomId);

      const response = {
        data: { ...roomState, ...(payload || {}) },
      };

      this.server.to(roomId).emit(TypeRoomEvent.GameUpdateState, response);

      this.logger.info(TypeRoomEvent.GameUpdateState);
      this.logger.info(response);
    }
  }

  private sendChatState(state: { roomId: string; chat: TypeChatMessage[] }) {
    const { roomId, chat } = state;

    if (roomId && chat.length > 0) {
      this.server.to(roomId).emit(TypeRoomEvent.GameChatState, chat);
    }
  }

  /**
   * Emit event, send data to client
   * @param {TypeRoomEvent} type
   * @param {TypeServerResponse} payload
   */
  private emitEvent(
    type: TypeRoomEvent,
    payload: TypeServerResponse | TypeRoomList | TypeChatMessage[],
    client: Socket | null = null,
  ): void {
    const response = { data: payload };

    this.logger.info(type);
    this.logger.info(response);

    if (client !== null) {
      client.emit(type, response);
    } else {
      this.server.emit(type, response);
    }
  }
}
