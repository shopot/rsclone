import { useEffect, useCallback } from 'react';
import { useModal } from '../../hooks';
import { useOldGameUI } from '../../hooks/useOldGameUI';
import { socketIOService } from '../../shared/api/socketio';
import { useUserStore } from '../../store/userStore';
import { TypeResponseObject, TypeSocketEvent, TypeServerErrorType } from '../../shared/types';
import { ModalContainer } from '../ModalContainer';
import { RoomForm } from '../RoomForm';

export const RoomJoinContainer = ({ isCanJoin, roomId }: IRoomJoinContainerProps) => {
  const [isOpen, toggle] = useModal();
  const [isOldGameUI, setOldGameUI, redirectToGamePage] = useOldGameUI();
  const { user, actions } = useUserStore();

  const handleError = useCallback(
    (response: TypeResponseObject) => {
      if (response.data.error && response.data.error.type === TypeServerErrorType.UserNotFound) {
        void actions.logout();
      }
      console.error(response.data.error && response.data.error.message);
    },
    [actions],
  );

  useEffect(() => {
    // Subscribe to GameJoinRoom event
    socketIOService.listen<TypeResponseObject>(TypeSocketEvent.GameJoinRoom, (data) =>
      redirectToGamePage(data),
    );

    return () => {
      socketIOService.remove<TypeResponseObject>(TypeSocketEvent.GameJoinRoom, (data) =>
        redirectToGamePage(data),
      );
    };
  }, [redirectToGamePage, isOldGameUI]);

  useEffect(() => {
    socketIOService.listen<TypeResponseObject>(TypeSocketEvent.GameServerError, (response) => {
      handleError(response);
    });

    return () => {
      socketIOService.remove<TypeResponseObject>(TypeSocketEvent.GameServerError, (response) => {
        handleError(response);
      });
    };
  }, [handleError]);

  const handleJoinRoom = (testCaseName: string, oldGameUI: boolean): void => {
    toggle();
    setOldGameUI(oldGameUI);
    socketIOService.emit(TypeSocketEvent.GameJoinRoom, {
      data: { roomId, userId: user?.userId },
    });
  };

  return (
    <>
      <ModalContainer
        isOpen={isOpen}
        toggle={toggle}
      >
        <RoomForm
          title="Join to Room"
          onSubmit={handleJoinRoom}
          onCancel={toggle}
        />
      </ModalContainer>
      <button
        className="btn"
        type="button"
        disabled={!isCanJoin}
        onClick={toggle}
      >
        {isCanJoin ? 'Join' : 'Playing'}
      </button>
    </>
  );
};

export declare interface IRoomJoinContainerProps {
  isCanJoin: boolean;
  roomId: string;
}
