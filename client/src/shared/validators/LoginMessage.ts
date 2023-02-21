import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { TypeLoginMessage } from '../types';

const ajv = new Ajv();

const schema: JTDSchemaType<TypeLoginMessage> = {
  properties: {
    data: {
      properties: {
        userId: { type: 'int32' },
        username: { type: 'string' },
        avatar: { type: 'string' },
      },
    },
    message: { enum: ['ok'] },
  },
};

export const LoginMessageValidator = ajv.compile(schema);
