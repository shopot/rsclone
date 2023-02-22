import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { TypeRatingItem } from '../types';

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

export const RatingValidator = ajv.compile(schema);
