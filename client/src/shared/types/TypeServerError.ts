import { TypeServerErrorType } from './TypeServerErrorType';

export type TypeServerError = {
  type: TypeServerErrorType;
  message: string;
};
