import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketIOService } from '../../shared/api/socketio';
import { TypeSocketEvent } from '../../shared/types/TypeSocketEvent';
import { TypeRoomStatus } from '../../shared/types/TypeRoomStatus';
import { MAX_NUMBER_OF_PLAYERS } from '../../shared/constants';
import featherSprite from 'feather-icons/dist/feather-sprite.svg';
import styles from './styles.m.scss';
import { TypeResponseObject, TypeResponseRoomList } from '../../shared/types';
import { useRoomsStore } from '../../store/roomsStore';

const HomePage = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const { rooms, actions } = useRoomsStore();
  // const [rooms, setRooms] = useState<TypeResponseRoomList>([]);

  useEffect(() => {
    // Subscribe to GameCreateRoom event
    socketIOService.listen<TypeResponseObject>(TypeSocketEvent.GameCreateRoom, ({ data }) => {
      actions.setRooms();

      // navigate(`/game/${data.roomId}`);
      console.log(data);
    });

    // Subscribe to game errors
    socketIOService.listen(TypeSocketEvent.GameServerError, (data) => console.log(data));

    // Get rooms list
    socketIOService.emit(TypeSocketEvent.GameRooms, { data: {} });
  }, [navigate]);

  const handleChangePlayerName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  };

  const handleCreateRoom = () => {
    socketIOService.emit(TypeSocketEvent.GameCreateRoom, { data: {} });
  };

  const handleJoinRoom = (roomId: string) => {
    socketIOService.emit(TypeSocketEvent.GameJoinRoom, {
      data: { roomId, playerId: playerName },
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
              room.status === TypeRoomStatus.GameInProgress;

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

export default HomePage;
