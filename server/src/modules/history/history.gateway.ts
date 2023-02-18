import { Inject } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Server } from 'socket.io';
import { HistoryService } from './history.service';
import { Logger as WinstonLogger } from 'winston';

@WebSocketGateway({ cors: true })
export class HistoryGateway {
  constructor(
    private historyService: HistoryService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('historyGetList')
  handleGetHistoryList(@MessageBody() message: string): void {
    this.logger.info(message);

    this.historyService.getAll().then((results) => {
      this.server.emit('historyGetList', results);
    });
  }
}
