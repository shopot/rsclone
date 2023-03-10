export enum TypeGameErrorType {
  JoinRoomFailed = 'JoinRoomFailed',
  LeaveRoomFailed = 'LeaveRoomFailed',
  CreateRoomFailed = 'CreateRoomFailed',
  NextPlayerFailed = 'NextPlayerFailed',
  OpenCardFailed = 'OpenCardFailed',
  CloseCardFailed = 'CloseCardFailed',
  AttackerPassFailed = 'AttackerPassFailed',
  DefenderPickupFailed = 'DefenderPickupFailed',
  GameStartFailed = 'GameStartFailed',
  GameRestartFailed = 'GameRestartFailed',
  GameRoomOpenFailed = 'GameRoomOpenFailed',
  GameRoomNotFound = 'GameRoomNotFound',
  MessageSendFailed = 'MessageSendFailed',
  UnknownError = 'UnknownError',
  UserNotFound = 'UserNotFound',
}

export type TypeGameError = {
  type: TypeGameErrorType;
  message: string;
};
