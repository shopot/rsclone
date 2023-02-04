import { TypeServerResponse } from '../types/TypeServerResponse';

export interface IGameService {
  setFromServerGameIsStart(payload?: TypeServerResponse): Promise<void>;
  setFromServerGameIsOver(payload?: TypeServerResponse): Promise<void>;
  setFromServerGameWaitingForStart(payload?: TypeServerResponse): Promise<void>;

  setFromServerAttackerSetActive(payload?: TypeServerResponse): Promise<void>;
  setFromServerAttackerOpenSuccess(payload?: TypeServerResponse): Promise<void>;
  setFromServerAttackerOpenFail(payload?: TypeServerResponse): Promise<void>;
  setFromServerAttackerPass(payload?: TypeServerResponse): Promise<void>;

  setFromServerDefenderSetActive(payload?: TypeServerResponse): Promise<void>;
  setFromServerDefenderCloseSuccess(
    payload?: TypeServerResponse,
  ): Promise<void>;
  setFromServerDefenderCloseFail(payload?: TypeServerResponse): Promise<void>;
  setFromServerDefenderPickUpCards(payload?: TypeServerResponse): Promise<void>;

  setFromServerSendPlayerStatus(payload?: TypeServerResponse): Promise<void>;
  setFromServerJoinRoomSuccess(payload?: TypeServerResponse): Promise<void>;
  setFromServerJoinRoomFail(payload?: TypeServerResponse): Promise<void>;
  setFromServerLeaveRoomSuccess(payload?: TypeServerResponse): Promise<void>;
}
