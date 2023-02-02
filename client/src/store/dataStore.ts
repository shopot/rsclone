import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SOCKET_IO_ENDPOINT } from '../app/config';

type TypeHistoryItem = {
  id: number;
  players: string[];
  loser: string;
  duration: number;
  rounds: number;
};

type TypeRatingItem = {
  id: number;
  player: string;
  wins: number;
  total: number;
  lastGameAt: number;
};

type TypeDataState = {
  historyResults: TypeHistoryItem[];
  ratingResults: TypeRatingItem[];
  isOnline: boolean;

  actions: {
    setHistoryList: () => void;
    setRatingList: () => void;
  };
};

interface ServerToClientEvents {
  historyGetList: (state: TypeHistoryItem[]) => void;
  ratingGetList: (state: TypeRatingItem[]) => void;
}

interface ClientToServerEvents {
  historyGetList: () => void;
  ratingGetList: () => void;
}

export const useDataStore = create<TypeDataState>((set) => {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_IO_ENDPOINT);

  socket
    .on('connect', () => {
      set({ isOnline: true });
    })
    .on('disconnect', () => {
      set({ isOnline: false });
    })
    .on('historyGetList', (state) => {
      // Вот тут возможно нужно получить старый стейт и если оба пусты то пропустить обновление стейта
      set({ historyResults: state });
    })
    .on('ratingGetList', (state) => {
      set({ ratingResults: state });
    });

  return {
    historyResults: [],
    ratingResults: [],
    isOnline: false,

    actions: {
      setHistoryList() {
        socket.emit('historyGetList');
      },
      setRatingList() {
        socket.emit('ratingGetList');
      },
    },
  };
});
