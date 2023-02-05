import { randomBytes } from 'node:crypto';
import { ROOM_ID_LENGTH } from '../constants';

export const generateRoomId = (): string => {
  return randomBytes(Math.round(ROOM_ID_LENGTH / 2)).toString('hex');
};
