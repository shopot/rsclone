import { customAlphabet } from 'nanoid';
import { ROOM_NAME_LENGTH } from '../constants';

const nanoid = customAlphabet(
  '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ROOM_NAME_LENGTH,
);

export const generateRoomName = () => {
  return nanoid();
};
