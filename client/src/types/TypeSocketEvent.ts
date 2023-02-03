export const enum TypeSocketEvent {
  HistoryGetList = 'historyGetList',
  RatingGetList = 'ratingGetList',

  // client events
  GameFromClientCreatePlayer = 'gameFromClientCreatePlayer',
  GameFromClientChatMessage = 'gameFromClientChatMessage',
  GameFromClientJoinRoom = 'gameFromClientJoinRoom',
  GameFromClientCreateRoom = 'gameFromClientCreateRoom',
  GameFromClientLeaveRoom = 'gameFromClientLeaveRoom',
  GameFromClientStartGame = 'gameFromClientStartGame',
  GameFromClientAttackerOpen = 'gameFromClientAttackerOpen',
  GameFromClientAttackerPass = 'gameFromClientAttackerPass',
  GameFromClientDefenderClose = 'gameFromClientDefenderClose',
  GameFromClientDefenderTake = 'gameFromClientDefenderTake',
  GameFromClientSettings = 'gameFromClientSettings',

  // server events
  GameFromServerChatMessage = 'gameFromServerChatMessage',
}
