import { Logger } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HistoryService } from './history.service';

@WebSocketGateway({ cors: true })
export class HistoryGateway {
  constructor(private historyService: HistoryService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('historyGetList')
  handleGetHistoryList(@MessageBody() message: string): void {
    Logger.debug(message);

    this.historyService.getAll().then((results) => {
      this.server.emit('historyGetList', results);
    });
  }
}
