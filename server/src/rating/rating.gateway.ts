import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RatingService } from './rating.service';

@WebSocketGateway({ cors: true })
export class RatingGateway {
  constructor(private ratingService: RatingService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('ratingGetList')
  handleMessage(@MessageBody() message: string): void {
    Logger.debug(message);

    this.ratingService.getAll().then((results) => {
      this.server.emit('ratingGetList', results);
    });

    console.log(message);
  }
}
