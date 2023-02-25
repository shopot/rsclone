import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { TypeAPIError } from '../types';

const ajv = new Ajv();

type TypeAPIErrorResponse = {
  data: TypeAPIError;
};

const schema: JTDSchemaType<TypeAPIErrorResponse> = {
  additionalProperties: true,
  properties: {
    data: {
      additionalProperties: true,
      properties: {
        statusCode: { type: 'int32' },
        message: { type: 'string' },
      },
    },
  },
};

export const validateAPIError = ajv.compile(schema);
