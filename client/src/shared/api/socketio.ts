import { io, Socket } from 'socket.io-client';
import { TypeSocketEvent } from '../types';
import { SOCKET_IO_ENDPOINT } from '../../app/config';

class SocketIOService {
  private socket: Socket;

  constructor() {
    this.socket = io(SOCKET_IO_ENDPOINT);
  }

  emit<T>(event: TypeSocketEvent, obj: { data: T }) {
    this.socket.emit(event, obj);
  }

  listen<T>(event: TypeSocketEvent, callback: (data: T) => void) {
    this.socket.on(event, callback);
  }

  remove<T>(event: TypeSocketEvent, callback: (data: T) => void) {
    this.socket.off(event, callback);
  }

  public getSocketId() {
    return this.socket.id;
  }
}

export const socketIOService = new SocketIOService();
