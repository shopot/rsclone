export enum TypeRoomEvent {
  // From Client
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
  gameFromServerError = 'gameFromServerError ',
  gameFromServerRoomStatusChange = 'gameFromServerRoomStatusChange',
  gameFromServerJoinRoomSuccess = 'gameFromServerJoinRoomSuccess',
  gameFromServerLeaveRoomSuccess = 'gameFromServerLeaveRoomSuccess',
  gameFromServerDealtCardsToPlayers = 'gameFromServerDealtCardsToPlayers',
  gameFromServerAttackerSetActive = 'gameFromServerAttackerSetActive',
  gameFromServerAttackerOpenSuccess = 'gameFromServerAttackerOpenSuccess',
  gameFromServerAttackerPass = 'gameFromServerAttackerPass',
  gameFromServerDefenderSetActive = 'gameFromServerDefenderSetActive',
  gameFromServerDefenderCloseSuccess = 'gameFromServerDefenderCloseSuccess',
  gameFromServerDefenderPickUpCards = 'gameFromServerDefenderPickUpCards',
  gameFromServerSendPlayerStatus = 'gameFromServerSendPlayerStatus',
  gameFromServerChatMessage = 'gameFromServerChatMessage',

  GameRooms = 'GameRooms',
  GameUpdateState = 'GameUpdateState',
  GameCreateRoom = 'GameCreateRoom',
  GameJoinRoom = 'GameJoinRoom',
  GameLeaveRoom = 'GameLeaveRoom',
}