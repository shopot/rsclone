import useModal from '../../hooks/useModal';
import { ModalContainer } from '../ModalContainer';
import styles from './RoomCreateContainer.m.scss';
import { RoomForm } from '../RoomForm';
import { TypeResponseObject, TypeSocketEvent } from '../../shared/types';
import { socketIOService } from '../../shared/api/socketio';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export const RoomCreateContainer = () => {
  const navigate = useNavigate();
  const [isOpen, toggle] = useModal();
  const [oldGameUI, setOldGameUI] = useState(true);

  useEffect(() => {
    const cb = ({ data }: TypeResponseObject) => {
      if (oldGameUI) {
        navigate(`/gameold/${data.roomId}`);
      } else {
        navigate(`/game/${data.roomId}`);
      }
      console.log(data);
    };

    // Subscribe to GameCreateRoom event
    socketIOService.listen<TypeResponseObject>(TypeSocketEvent.GameCreateRoom, (data) => cb(data));

    return () => {
      socketIOService.remove<TypeResponseObject>(TypeSocketEvent.GameCreateRoom, (data) =>
        cb(data),
      );
    };
  }, [navigate, oldGameUI]);

  const handleCreateRoom = (playerName: string, oldGameUI = true): void => {
    console.log('handleCreateRoom');
    socketIOService.emit(TypeSocketEvent.GameCreateRoom, { data: { playerName } });
    toggle();
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
