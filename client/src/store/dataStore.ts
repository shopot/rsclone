import { create } from 'zustand';
import { socketIOService } from '../shared/api/socketio';
import { TypeSocketEvent } from '../shared/types/TypeSocketEvent';

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

export const useDataStore = create<TypeDataState>((set) => {
  socketIOService.listen(TypeSocketEvent.Connect, () => {
    set({ isOnline: true });
  });

  socketIOService.listen(TypeSocketEvent.Disconnect, () => {
    set({ isOnline: false });
  });

  socketIOService.listen<TypeHistoryItem[]>(TypeSocketEvent.HistoryGetList, (state) => {
    // Вот тут возможно нужно получить старый стейт и если оба пусты то пропустить обновление стейта
    set({ historyResults: state });
  });

  socketIOService.listen<TypeRatingItem[]>(TypeSocketEvent.RatingGetList, (state) => {
    set({ ratingResults: state });
  });

  return {
    historyResults: [],
    ratingResults: [],
    isOnline: false,

    actions: {
      setHistoryList() {
        socketIOService.emit(TypeSocketEvent.HistoryGetList, { data: {} });
      },
      setRatingList() {
        socketIOService.emit(TypeSocketEvent.RatingGetList, { data: {} });
      },
    },
  };
});
