import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { TypeLoginRegisterMessage } from '../types';

const ajv = new Ajv();

const schema: JTDSchemaType<TypeLoginRegisterMessage> = {
  properties: {
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

export const LoginRegisterMessageValidator = ajv.compile(schema);
