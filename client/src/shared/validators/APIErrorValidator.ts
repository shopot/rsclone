import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { TypeAPIError } from '../types';

const ajv = new Ajv();

const schema: JTDSchemaType<TypeAPIError> = {
  properties: {
    statusCode: { type: 'int32' },
    message: { type: 'string' },
    error: { type: 'string' },
  },
};

export const APIErrorValidator = ajv.compile(schema);
