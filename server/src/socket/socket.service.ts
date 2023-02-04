import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketService {
  public socketIo: Server;
}
