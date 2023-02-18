import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import ky from 'ky';
import { APP_BACKEND_API_URL_DEFAULT } from '../app/config';

type TypeHistoryItem = {
  id: number;
  players: string[];
  loser: string;
  duration: number;
  rounds: number;
  createdAt: number;
};

const ajv = new Ajv();

const schema: JTDSchemaType<TypeHistoryItem[]> = {
  elements: {
    properties: {
      id: { type: 'int32' },
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
      const json = await ky.get('history', { prefixUrl: APP_BACKEND_API_URL_DEFAULT }).json();

      if (validate(json)) {
        return { data: json, error: null };
      }
      return { data: null, error: 'Data validation error' };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown fetch error' };
    }
  },
};
