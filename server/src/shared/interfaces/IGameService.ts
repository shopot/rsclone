import { TypeGameError } from '../types';
import { TypeServerResponse } from '../types/TypeServerResponse';

export interface IGameService {
  setFromServerRoomStatusChange(payload?: TypeServerResponse): Promise<void>;

  setFromServerAttackerSetActive(payload?: TypeServerResponse): Promise<void>;
  setFromServerAttackerOpenSuccess(payload?: TypeServerResponse): Promise<void>;
  setFromServerAttackerPass(payload?: TypeServerResponse): Promise<void>;

  setFromServerDefenderSetActive(payload?: TypeServerResponse): Promise<void>;
  setFromServerDefenderCloseSuccess(
    payload?: TypeServerResponse,
  ): Promise<void>;
  setFromServerDefenderPickUpCards(payload?: TypeServerResponse): Promise<void>;

  setFromServerSendPlayerStatus(payload?: TypeServerResponse): Promise<void>;
  setFromServerJoinRoomSuccess(payload?: TypeServerResponse): Promise<void>;
  setFromServerLeaveRoomSuccess(payload?: TypeServerResponse): Promise<void>;

  setFromServerDealtCardsToPlayers(payload?: TypeServerResponse): Promise<void>;

  setFromServerError(
    error: TypeGameError,
    payload?: TypeServerResponse,
  ): Promise<void>;
}
