import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SOCKETIO_ENDPOINT } from '../app/config';

type TypeHistoryItem = {
  id: number;
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
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKETIO_ENDPOINT);

  socket
    .on('connect', () => {
      set({ isOnline: true });
    })
    .on('disconnect', () => {
      set({ isOnline: false });
    })
    .on('historyGetList', (state) => {
      // Вот тут возможно нужно получить старый стейт и если оба пусты то пропустить обновление стейта
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
