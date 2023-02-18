import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import ky from 'ky';
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

export const ratingService = {
  async getAll() {
    try {
      const json = await ky.get('rating', { prefixUrl: HTTP_ENDPOINT }).json();

      if (validate(json)) {
        return { data: json, error: null };
      }
      return { data: null, error: 'Data validation error' };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown fetch error' };
    }
  },
};
