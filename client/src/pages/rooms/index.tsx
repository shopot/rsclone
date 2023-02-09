import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketIOService } from '../../shared/api/socketio';
import { TypeSocketEvent } from '../../shared/types/TypeSocketEvent';
import { TypeRoomStatus } from '../../shared/types/TypeRoomStatus';
import { MAX_NUMBER_OF_PLAYERS } from '../../shared/constants';
import featherSprite from 'feather-icons/dist/feather-sprite.svg';
import styles from './styles.m.scss';
import { TypeResponseObject } from '../../shared/types';
import { useRoomsStore } from '../../store/roomsStore';

const RoomsPage = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [oldGameUI, setOldGameUI] = useState(true);
  const { actions } = useRoomsStore();
  const rooms = useRoomsStore((state) => state.rooms);

  useEffect(() => {
    const cb = ({ data }: TypeResponseObject) => {
      actions.setRooms();
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
  }, [actions, navigate, oldGameUI]);

  useEffect(() => {
    const cb = ({ data }: TypeResponseObject) => {
      if (oldGameUI) {
        navigate(`/gameold/${data.roomId}`);
      } else {
        navigate(`/game/${data.roomId}`);
      }
      console.log(data);
    };

    // Subscribe to GameJoinRoom event
    socketIOService.listen<TypeResponseObject>(TypeSocketEvent.GameJoinRoom, (data) => cb(data));

    return () => {
      socketIOService.remove<TypeResponseObject>(TypeSocketEvent.GameJoinRoom, (data) => cb(data));
    };
  }, [navigate, oldGameUI]);

  useEffect(() => {
    const cb = (data: TypeResponseObject) => {
      console.log(data);
    };
    // Subscribe to game errors
    socketIOService.listen<TypeResponseObject>(TypeSocketEvent.GameServerError, (data) => cb(data));

    return () => {
      socketIOService.remove<TypeResponseObject>(TypeSocketEvent.GameServerError, (data) =>
        cb(data),
      );
    };
  }, []);

  useEffect(() => {
    // Get rooms list
    socketIOService.emit(TypeSocketEvent.GameRooms, { data: {} });
  }, []);

  const handleChangePlayerName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  };

  const handleCreateRoom = () => {
    socketIOService.emit(TypeSocketEvent.GameCreateRoom, { data: { playerName } });
  };

  const handleJoinRoom = (roomId: string) => {
    socketIOService.emit(TypeSocketEvent.GameJoinRoom, {
      data: { roomId, playerName },
    });
  };

  return (
    <div className="container">
      <div className={styles.roomInterface}>
        <label className={styles.playerName}>
          <span>Player&nbsp;name:</span>
          <input
            className={styles.playerNameInput}
            type="text"
            placeholder="enter your name"
            value={playerName}
            onChange={handleChangePlayerName}
          />
        </label>
        <ul className={styles.roomList}>
          {rooms.map((room) => {
            const playing =
              room.playersCount === MAX_NUMBER_OF_PLAYERS ||
              room.status === TypeRoomStatus.GameInProgress;
            const disabled =
              !playerName ||
              room.playersCount === MAX_NUMBER_OF_PLAYERS ||
              ![TypeRoomStatus.WaitingForPlayers, TypeRoomStatus.WaitingForStart].includes(
                room.status,
              );

            return (
              <li
                className={`${styles.roomEntry} ${!playing ? styles.roomEntryJoin : ''} ${
                  disabled ? styles.roomEntryDisabled : ''
                }`}
                key={room.roomId}
              >
                <span>room-{room.roomId}</span>
                <span className={styles.playersSpan}>
                  <svg className="feather">
                    <use href={`${featherSprite}#${room.playersCount === 1 ? 'user' : 'users'}`} />
                  </svg>
                  {room.playersCount}/{MAX_NUMBER_OF_PLAYERS}
                </span>
                <button
                  className="btn"
                  type="button"
                  disabled={disabled}
                  onClick={() => handleJoinRoom(room.roomId)}
                >
                  {playing ? 'Playing' : 'Join'}
                </button>
              </li>
            );
          })}
        </ul>
        <label className={styles.oldUI}>
          Old UI:
          <input
            type="checkbox"
            checked={oldGameUI}
            onChange={() => setOldGameUI(!oldGameUI)}
          />
        </label>
        <button
          className="btn btn-lg"
          type="button"
          disabled={!playerName}
          onClick={handleCreateRoom}
        >
          Create Room
        </button>
      </div>
    </div>
  );
};

export default RoomsPage;
