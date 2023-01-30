import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class RatingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('ratingMessage')
  handleMessage(@MessageBody() message: string): void {
    this.server.emit('ratingMessage', message);
    console.log(message);
  }
}
