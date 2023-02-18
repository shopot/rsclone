import { create } from 'zustand';
import { historyService } from '../services/historyService';
import { ratingService } from '../services/ratingService';
import { TypeHistoryItem } from '../shared/types/TypeHistoryItem';
import { TypeRatingItem } from '../shared/types';

type TypeDataState = {
  history: {
    data: TypeHistoryItem[] | null;
    error: string | null;
  };

  rating: {
    data: TypeRatingItem[] | null;
    error: string | null;
  };

  actions: {
    setHistoryList: () => Promise<void>;
    setRatingList: () => Promise<void>;
  };
};

export const useDataStore = create<TypeDataState>((set) => {
  return {
    history: { data: null, error: null },
    rating: { data: null, error: null },

    actions: {
      async setHistoryList() {
        const result = await historyService.getAll();

        set({ history: result });
      },

      async setRatingList() {
        const result = await ratingService.getAll();

        set({ rating: result });
      },
    },
  };
});
