import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { TypeAuthResponse } from '../types';

const ajv = new Ajv();

const schema: JTDSchemaType<TypeAuthResponse> = {
  properties: {
    statusCode: { type: 'int32' },
    data: {
      properties: {
        userId: { type: 'int32' },
        username: { type: 'string' },
        avatar: { type: 'string' },
      },
    },
    message: { enum: ['ok', 'created'] },
  },
};

export const validateAuthResponse = ajv.compile(schema);
