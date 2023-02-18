import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import ky from 'ky';
import { TypeHistoryItem } from '../shared/types/TypeHistoryItem';
import { HTTP_ENDPOINT } from '../app/config';

const ajv = new Ajv();

const schema: JTDSchemaType<TypeHistoryItem[]> = {
  elements: {
    properties: {
      id: { type: 'int32' },
      roomId: { type: 'string' },
      players: { elements: { type: 'string' } },
      loser: { type: 'string' },
      duration: { type: 'int32' },
      rounds: { type: 'int32' },
      createdAt: { type: 'int32' },
    },
  },
};

const validate = ajv.compile(schema);

export const historyService = {
  async getAll() {
    try {
      const json = await ky.get('history', { prefixUrl: HTTP_ENDPOINT }).json();

      if (validate(json)) {
        return { data: json, error: null };
      }
      return { data: null, error: 'Data validation error' };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown fetch error' };
    }
  },
};
