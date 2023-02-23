import { useEffect } from 'react';
import { useModal } from '../../hooks';
import { ModalContainer } from '../ModalContainer';
import { RoomForm } from '../RoomForm';
import { socketIOService } from '../../shared/api/socketio';
import { useUserStore } from '../../store/userStore';
import { useOldGameUI } from '../../hooks/useOldGameUI';
import { TypeResponseObject, TypeSocketEvent } from '../../shared/types';
import styles from './RoomCreateContainer.m.scss';

export const RoomCreateContainer = () => {
  const [isOpen, toggle] = useModal();
  const [isOldGameUI, setOldGameUI, redirectToGamePage] = useOldGameUI();
  const { user } = useUserStore();

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

  const handleCreateRoom = (testCaseName = '', oldGameUI = true): void => {
    toggle();
    setOldGameUI(oldGameUI);
    socketIOService.emit(TypeSocketEvent.GameCreateRoom, {
      data: { userId: user?.userId, testCaseName },
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
