import { TypePlayerDto } from './TypePlayerDto';

export type TypeChatMessage = {
  sender: TypePlayerDto;
  timestamp: number;
  message: string;
};
