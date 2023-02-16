import { Inject, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RatingService } from './rating.service';
import { Logger as WinstonLogger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@WebSocketGateway({ cors: true })
export class RatingGateway {
  constructor(
    private ratingService: RatingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('ratingGetList')
  handleMessage(@MessageBody() message: string): void {
    this.ratingService.getAll().then((results) => {
      this.server.emit('ratingGetList', results);
    });

    this.logger.info(message);
  }
}
