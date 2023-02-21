import { create } from 'zustand';
import { simpleApiClient, HTTPRequestMethod, ApiEndpoint } from '../shared/api';
import { HistoryValidator, RatingValidator } from '../shared/validators';
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
        const result = await simpleApiClient.fetch(
          HTTPRequestMethod.GET,
          ApiEndpoint.History,
          HistoryValidator,
        );

        set({ history: result });
      },

      async setRatingList() {
        const result = await simpleApiClient.fetch(
          HTTPRequestMethod.GET,
          ApiEndpoint.Rating,
          RatingValidator,
        );

        set({ rating: result });
      },
    },
  };
});
