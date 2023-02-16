import useModal from '../../hooks/useModal';
import { ModalContainer } from '../ModalContainer';
import styles from './RoomCreateContainer.m.scss';
import { RoomForm } from '../RoomForm';
import { TypeResponseObject, TypeSocketEvent } from '../../shared/types';
import { socketIOService } from '../../shared/api/socketio';
import { useEffect } from 'react';
import { useOldGameUI } from '../../hooks/useOldGameUI';

export const RoomCreateContainer = () => {
  const [isOpen, toggle] = useModal();
  const [isOldGameUI, setOldGameUI, redirectToGamePage] = useOldGameUI();

  useEffect(() => {
    // Subscribe to GameCreateRoom event
    socketIOService.listen<TypeResponseObject>(TypeSocketEvent.GameCreateRoom, (data) =>
      redirectToGamePage(data),
    );

    return () => {
      socketIOService.remove<TypeResponseObject>(TypeSocketEvent.GameCreateRoom, (data) =>
        redirectToGamePage(data),
      );
    };
  }, [redirectToGamePage, isOldGameUI]);

  const handleCreateRoom = (
    playerName: string,
    playerAvatar: string,
    testName = '',
    oldGameUI = true,
  ): void => {
    toggle();
    setOldGameUI(oldGameUI);
    socketIOService.emit(TypeSocketEvent.GameCreateRoom, {
      data: { playerName, playerAvatar, testName },
    });
  };

  return (
    <>
      <ModalContainer
        isOpen={isOpen}
        toggle={toggle}
      >
        <RoomForm
          title="Create New Room"
          onSubmit={handleCreateRoom}
          onCancel={toggle}
        />
      </ModalContainer>
      <section className={styles.CreateRoom}>
        <button
          className="btn btn-lg"
          type="button"
          onClick={toggle}
        >
          Create Room
        </button>
      </section>
    </>
  );
};
