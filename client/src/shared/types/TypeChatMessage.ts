import { TypePlayer } from './TypePlayer';

export type TypeChatMessage = {
  sender: TypePlayer;
  timestamp: number;
  message: string;
};
