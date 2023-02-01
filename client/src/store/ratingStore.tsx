import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = 'http://localhost:3000';

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
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(WEBSOCKET_URL);

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
