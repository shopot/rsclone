import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { TypeHistoryItem } from '../types';

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

export const validateHistoryList = new Ajv().compile(schema);
