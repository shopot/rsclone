import { TypeGameErrorType } from '../types';

export const getErrorMessage = (type: TypeGameErrorType): string => {
  switch (type) {
    case TypeGameErrorType.JoinRoomFailed: {
      return 'Room is closed and not waiting for new players.';
    }
    case TypeGameErrorType.LeaveRoomFailed: {
      return 'Room not found.';
    }
    case TypeGameErrorType.CreateRoomFailed: {
      return 'Room not found.';
    }
    case TypeGameErrorType.NextPlayerFailed: {
      return 'Room not found.';
    }
    case TypeGameErrorType.OpenCardFailed: {
      return 'Only active player is allowed to perform this action.';
    }
    case TypeGameErrorType.CloseCardFailed: {
      return 'Only active player is allowed to perform this action.';
    }
    case TypeGameErrorType.AttackerPassFailed: {
      return 'Only active player is allowed to perform this action.';
    }
    case TypeGameErrorType.DefenderPickupFailed: {
      return 'Only active player is allowed to perform this action.';
    }
    case TypeGameErrorType.GameStartFailed: {
      return 'Only host player can start the game.';
    }
    case TypeGameErrorType.GameRestartFailed: {
      return 'Only host player can restart the game.';
    }
    case TypeGameErrorType.GameRoomOpenFailed: {
      return 'Only host player can open the room.';
    }
    case TypeGameErrorType.GameRoomNotFound: {
      return 'Room not found.';
    }
    case TypeGameErrorType.MessageSendFailed: {
      return 'Message send failed.';
    }
    default:
      return 'Unknown error.';
  }
};
