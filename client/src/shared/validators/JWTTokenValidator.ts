import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { TypeJWTTokens } from '../types';

const ajv = new Ajv();

const schema: JTDSchemaType<TypeJWTTokens> = {
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
  },
};

export const JWTTokenValidator = ajv.compile(schema);
