import { TypeHistoryItem } from './../shared/types/TypeHistoryItem';
import { ApiEndpoint, HTTPRequestMethod, simpleApiClient } from './../shared/api/simpleApiClient';
import { validateHistoryList } from '../shared/validators';

export const historyService = {
  async getAll() {
    const { status, data } = await simpleApiClient.fetch<TypeHistoryItem[]>(
      HTTPRequestMethod.GET,
      ApiEndpoint.History,
    );

    if (status === 200 && validateHistoryList(data)) {
      return data;
    }

    return [];
  },
};
