import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

const WEBSOCKET_URL = 'http://localhost:3000';

type TypeHistoryItem = {
  players: string[];
  loser: string;
  duration: number;
  rounds: number;
};

type TypeHistoryState = {
  results: TypeHistoryItem[];
  isOnline: boolean;

  actions: {
    setHistoryList: () => void;
  };
};

interface ServerToClientEvents {
  historyGetList: (state: TypeHistoryItem[]) => void;
}

interface ClientToServerEvents {
  historyGetList: () => void;
}

export const useHistoryStore = create<TypeHistoryState>((set) => {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(WEBSOCKET_URL);

  socket
    .on('connect', () => {
      set({ isOnline: true });
    })
    .on('disconnect', () => {
      set({ isOnline: false });
    })
    .on('historyGetList', (state) => {
      set({ results: state });
    });

  return {
    results: [],
    isOnline: false,

    actions: {
      setHistoryList() {
        socket.emit('historyGetList');
      },
    },
  };
});
