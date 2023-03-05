import { TypePayload } from '../types';
import { Request } from 'express';

export const hasUser = (
  req: Request,
): req is Request & { user: TypePayload } => {
  return 'user' in req;
};
