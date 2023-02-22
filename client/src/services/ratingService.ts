import { TypeRatingItem } from './../shared/types/TypeRatingItem';
import { ApiEndpoint, HTTPRequestMethod, simpleApiClient } from './../shared/api/simpleApiClient';
import { validateRatingList } from '../shared/validators';

export const ratingService = {
  async getAll() {
    const { status, data } = await simpleApiClient.fetch<TypeRatingItem[]>(
      HTTPRequestMethod.GET,
      ApiEndpoint.Rating,
    );

    if (status === 200 && validateRatingList(data)) {
      return data;
    }

    return [];
  },
};
