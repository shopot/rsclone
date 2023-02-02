import cryptoRandomString from 'crypto-random-string';
import { ROOM_NAME_LENGTH } from '../constants';

export const generateRoomName = (): string => {
  return cryptoRandomString({ length: ROOM_NAME_LENGTH, type: 'base64' });
};
