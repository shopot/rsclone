export enum TypeRoomEvent {
  fromServerGameStart = 'fromServerGameStart',
  fromServerGameOver = 'fromServerGameOver',

  fromServerAttackerSetActive = 'fromServerAttackerSetActive',
  fromServerAttackerOpenSuccess = 'fromServerAttackerOpenSuccess',
  fromServerAttackerOpenFail = 'fromServerAttackerOpenFail',
  fromServerAttackerPass = 'fromServerAttackerPass',

  fromServerDefenderSetActive = 'fromServerDefenderSetActive',
  fromServerDefenderCloseSuccess = 'fromServerDefenderCloseSuccess',
  fromServerDefenderCloseFail = 'fromServerDefenderCloseFail',

  fromServerSendPlayerStatus = 'fromServerSendPlayerStatus',
}
