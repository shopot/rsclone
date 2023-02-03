export enum TypeRoomEvent {
  gameFromClientGameStart = 'gameFromClientGameStart',

  // From Server
  gameFromServerGameStart = 'gameFromServerGameStart',
  gameFromServerGameOver = 'gameFromServerGameOver',

  gameFromServerAttackerSetActive = 'gameFromServerAttackerSetActive',
  gameFromServerAttackerOpenSuccess = 'gameFromServerAttackerOpenSuccess',
  gameFromServerAttackerOpenFail = 'gameFromServerAttackerOpenFail',
  gameFromServerAttackerPass = 'gameFromServerAttackerPass',

  gameFromServerDefenderSetActive = 'gameFromServerDefenderSetActive',
  gameFromServerDefenderCloseSuccess = 'gameFromServerDefenderCloseSuccess',
  gameFromServerDefenderCloseFail = 'gameFromServerDefenderCloseFail',

  gameFromServerSendPlayerStatus = 'gameFromServerSendPlayerStatus',
}
