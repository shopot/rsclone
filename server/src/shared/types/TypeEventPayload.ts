import { TypePlayerStatus } from './TypePlayerStatus';

export type TypeEventPayload = {
  roomId?: string;
  playerId?: string;
  playerStatus?: TypePlayerStatus;
};
