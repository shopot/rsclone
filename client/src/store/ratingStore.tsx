import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SOCKETIO_ENDPOINT } from '../app/config';

type TypeRatingItem = {
  player: string;
  wins: number;
  total: number;
  lastGameAt: number;
};

type TypeRatingState = {
  results: TypeRatingItem[];
  isOnline: boolean;

  actions: {
    setRatingList: () => void;
  };
};

interface ServerToClientEvents {
  ratingGetList: (state: TypeRatingItem[]) => void;
}

interface ClientToServerEvents {
  ratingGetList: () => void;
}

export const useRatingStore = create<TypeRatingState>((set) => {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKETIO_ENDPOINT);

  socket
    .on('connect', () => {
      set({ isOnline: true });
    })
    .on('disconnect', () => {
      set({ isOnline: false });
    })
    .on('ratingGetList', (state) => {
      set({ results: state });
    });

  return {
    results: [],
    isOnline: false,

    actions: {
      setRatingList() {
        socket.emit('ratingGetList');
      },
    },
  };
});
