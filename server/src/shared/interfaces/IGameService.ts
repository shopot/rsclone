import { TypeGameResponse } from '../types/TypeGameResponse';

export interface IGameService {
  setFromServerGameStart(payload?: TypeGameResponse): Promise<void>;
  setFromServerGameOver(payload?: TypeGameResponse): Promise<void>;
  setFromServerGameWaitingForStart(payload?: TypeGameResponse): Promise<void>;

  setFromServerAttackerSetActive(payload?: TypeGameResponse): Promise<void>;
  setFromServerAttackerOpenSuccess(payload?: TypeGameResponse): Promise<void>;
  setFromServerAttackerOpenFail(payload?: TypeGameResponse): Promise<void>;
  setFromServerAttackerPass(payload?: TypeGameResponse): Promise<void>;

  setFromServerDefenderSetActive(payload?: TypeGameResponse): Promise<void>;
  setFromServerDefenderCloseSuccess(payload?: TypeGameResponse): Promise<void>;
  setFromServerDefenderCloseFail(payload?: TypeGameResponse): Promise<void>;
  setFromServerDefenderPickUpCards(payload?: TypeGameResponse): Promise<void>;

  setFromServerSendPlayerStatus(payload?: TypeGameResponse): Promise<void>;
  setFromServerJoinRoomSuccess(payload?: TypeGameResponse): Promise<void>;
  setFromServerJoinRoomFail(payload?: TypeGameResponse): Promise<void>;
  setFromServerLeaveRoomSuccess(payload?: TypeGameResponse): Promise<void>;
}
