import { useEffect } from 'react';
import useModal from '../../hooks/useModal';
import { useOldGameUI } from '../../hooks/useOldGameUI';
import { socketIOService } from '../../shared/api/socketio';
import { TypeResponseObject, TypeSocketEvent } from '../../shared/types';
import { ModalContainer } from '../ModalContainer';
import { RoomForm } from '../RoomForm';

export const RoomJoinContainer = ({ isCanJoin, roomId }: IRoomJoinContainerProps) => {
  const [isOpen, toggle] = useModal();
  const [isOldGameUI, setOldGameUI, redirectToGamePage] = useOldGameUI();

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

  const handleJoinRoom = (playerName: string, playerAvatar: string, oldGameUI: boolean): void => {
    toggle();
    setOldGameUI(oldGameUI);
    socketIOService.emit(TypeSocketEvent.GameJoinRoom, {
      data: { roomId, playerName, playerAvatar },
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
