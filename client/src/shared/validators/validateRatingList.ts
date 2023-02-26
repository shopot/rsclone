import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { TypeRatingItem } from '../types';

const schema: JTDSchemaType<TypeRatingItem[]> = {
  elements: {
    properties: {
      id: { type: 'int32' },
      player: { type: 'string' },
      wins: { type: 'int32' },
      total: { type: 'int32' },
      userId: { type: 'int32' },
      lastGameAt: { type: 'int32' },
    },
  },
};

export const validateRatingList = new Ajv().compile(schema);
