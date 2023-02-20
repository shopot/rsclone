import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import axios from 'axios';
import { TypeRatingItem } from '../shared/types';
import { HTTP_ENDPOINT } from '../app/config';

const ajv = new Ajv();

const schema: JTDSchemaType<TypeRatingItem[]> = {
  elements: {
    properties: {
      id: { type: 'int32' },
      player: { type: 'string' },
      wins: { type: 'int32' },
      total: { type: 'int32' },
      lastGameAt: { type: 'int32' },
    },
  },
};

const validate = ajv.compile(schema);

type TypeRatingResponse = {
  data: TypeRatingItem[];
};

export const ratingService = {
  async getAll() {
    try {
      const { data } = await axios.get<TypeRatingResponse>('rating', {
        baseURL: HTTP_ENDPOINT,
      });

      if (validate(data)) {
        return { data, error: null };
      }
      return { data: null, error: 'Data validation error' };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown fetch error' };
    }
  },
};
