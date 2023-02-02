import { TypeGameResponse } from '../types/TypeGameResponse';

export interface IGameService {
  setFromServerGameStart(payload?: TypeGameResponse): void;
  setFromServerGameOver(payload?: TypeGameResponse): void;

  setFromServerAttackerSetActive(payload?: TypeGameResponse): void;
  setFromServerAttackerOpenSuccess(payload?: TypeGameResponse): void;
  setFromServerAttackerOpenFail(payload?: TypeGameResponse): void;
  setFromServerAttackerPass(payload?: TypeGameResponse): void;

  setFromServerDefenderSetActive(payload?: TypeGameResponse): void;
  setFromServerDefenderCloseSuccess(payload?: TypeGameResponse): void;
  setFromServerDefenderCloseFail(payload?: TypeGameResponse): void;
  setFromServerDefenderPickUpCards(payload?: TypeGameResponse): void;

  setFromServerSendPlayerStatus(payload?: TypeGameResponse): void;
}
