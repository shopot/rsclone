import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';

type TypeLocationState = {
  from: { pathname: string };
};

const schema: JTDSchemaType<TypeLocationState> = {
  properties: {
    from: {
      additionalProperties: true,
      properties: {
        pathname: { type: 'string' },
      },
    },
  },
};

export const validateLocationState = new Ajv().compile(schema);
