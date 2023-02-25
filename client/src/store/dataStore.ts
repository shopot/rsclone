import { create } from 'zustand';
import { TypeHistoryItem } from '../shared/types/TypeHistoryItem';
import { TypeRatingItem } from '../shared/types';

interface IGetHistoryCallback {
  (): Promise<TypeHistoryItem[]>;
}

interface IGetRatingCallback {
  (): Promise<TypeRatingItem[]>;
}

type TypeDataState = {
  history: TypeHistoryItem[];
  rating: TypeRatingItem[];

  actions: {
    setHistoryList: (callback: IGetHistoryCallback) => Promise<void>;
    setRatingList: (callback: IGetRatingCallback) => Promise<void>;
  };
};

export const useDataStore = create<TypeDataState>((set) => {
  return {
    history: [],
    rating: [],

    actions: {
      async setHistoryList(getHistoryCallback: IGetHistoryCallback) {
        const results = await getHistoryCallback();
        set({ history: results });
      },

      async setRatingList(getRatingCallback: IGetRatingCallback) {
        const results = await getRatingCallback();
        set({ rating: results });
      },
    },
  };
});
