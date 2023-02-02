import { randomBytes } from 'node:crypto';
import { ROOM_NAME_LENGTH } from '../constants';

export const generateRoomName = (): string => {
  return randomBytes(ROOM_NAME_LENGTH)
    .toString('base64')
    .slice(0, ROOM_NAME_LENGTH);
};
