export const enum TypeSocketEvent {
  // built-in events
  Connect = 'connect',
  Disconnect = 'disconnect',

  HistoryGetList = 'historyGetList',
  RatingGetList = 'ratingGetList',

  // client events
  GameFromClientCreatePlayer = 'gameFromClientCreatePlayer',
  GameFromClientChatMessage = 'gameFromClientChatMessage',
  GameFromClientGetRooms = 'gameFromClientGetRooms',
  GameFromClientJoinRoom = 'gameFromClientJoinRoom',
  GameFromClientCreateRoom = 'gameFromClientCreateRoom',
  GameFromClientLeaveRoom = 'gameFromClientLeaveRoom',
  GameFromClientStartGame = 'gameFromClientStartGame',
  GameFromClientAttackerOpen = 'gameFromClientAttackerOpen',
  GameFromClientAttackerPass = 'gameFromClientAttackerPass',
  GameFromClientDefenderClose = 'gameFromClientDefenderClose',
  GameFromClientDefenderTake = 'gameFromClientDefenderTake',
  GameFromClientSettings = 'gameFromClientSettings',
  GameFromClientRestartGame = 'gameFromClientRestartGame',
  GameFromClientOpenRoom = 'gameFromClientOpenRoom',

  // server events
  GameFromServerChatMessage = 'gameFromServerChatMessage',
  GameFromServerGetRooms = 'gameFromServerGetRooms',
  GameFromServerRoomStatusChange = 'gameFromServerRoomStatusChange',
  GameFromServerDealtCardsToPlayers = 'gameFromServerDealtCardsToPlayers',
  GameFromServerJoinRoomSuccess = 'gameFromServerJoinRoomSuccess',
  GameFromServerError = 'gameFromServerError',
}
