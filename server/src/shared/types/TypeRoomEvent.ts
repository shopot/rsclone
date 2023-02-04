export enum TypeRoomEvent {
  gameFromClientCreatePlayer = 'gameFromClientCreatePlayer',
  gameFromClientChatMessage = 'gameFromClientChatMessage',
  gameFromClientCreateRoom = 'gameFromClientCreateRoom',
  gameFromClientGameStart = 'gameFromClientGameStart',
  gameFromClientGetRooms = 'gameFromClientGetRooms',
  gameFromClientJoinRoom = 'gameFromClientJoinRoom',
  gameFromClientLeaveRoom = 'gameFromClientLeaveRoom',
  gameFromClientStartGame = 'gameFromClientStartGame',
  gameFromClientAttackerOpen = 'gameFromClientAttackerOpen',
  gameFromClientAttackerPass = 'gameFromClientAttackerPass',
  gameFromClientDefenderClose = 'gameFromClientDefenderClose',
  gameFromClientDefenderTake = 'gameFromClientDefenderTake',
  gameFromClientSettings = 'gameFromClientSettings',
  gameFromClientRestartGame = 'gameFromClientRestartGame',
  gameFromClientOpenRoom = 'gameFromClientOpenRoom',

  // From Server
  gameFromServerRoomStatusChange = 'gameFromServerRoomStatusChange',

  gameFromServerJoinRoomSuccess = 'gameFromServerJoinRoomSuccess',
  gameFromServerJoinRoomFail = 'gameFromServerJoinRoomFail',
  gameFromServerLeaveRoomSuccess = 'gameFromServerLeaveRoomSuccess',

  gameFromServerDealtCardsToPlayers = 'gameFromServerDealtCardsToPlayers',

  gameFromServerAttackerSetActive = 'gameFromServerAttackerSetActive',
  gameFromServerAttackerOpenSuccess = 'gameFromServerAttackerOpenSuccess',
  gameFromServerAttackerOpenFail = 'gameFromServerAttackerOpenFail',
  gameFromServerAttackerPass = 'gameFromServerAttackerPass',

  gameFromServerDefenderSetActive = 'gameFromServerDefenderSetActive',
  gameFromServerDefenderCloseSuccess = 'gameFromServerDefenderCloseSuccess',
  gameFromServerDefenderCloseFail = 'gameFromServerDefenderCloseFail',
  gameFromServerDefenderPickUpCards = 'gameFromServerDefenderPickUpCards',

  gameFromServerSendPlayerStatus = 'gameFromServerSendPlayerStatus',

  gameFromServerChatMessage = 'gameFromServerChatMessage',
}
