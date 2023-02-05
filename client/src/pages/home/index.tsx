import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketIOService } from '../../shared/api/socketio';
import { TypeSocketEvent } from '../../shared/types/TypeSocketEvent';
import { TypeRoomStatus } from '../../shared/types/TypeRoomStatus';
import { MAX_NUMBER_OF_PLAYERS } from '../../shared/constants';
import featherSprite from 'feather-icons/dist/feather-sprite.svg';
import styles from './styles.m.scss';

type TypeRoomDto = {
  roomId: string;
  playersCount: number;
  status: TypeRoomStatus;
};

type TypeRoomStatusChangeDto = {
  roomId: string;
  roomStatus: TypeRoomStatus;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [rooms, setRooms] = useState<TypeRoomDto[]>([]);

  useEffect(() => {
    socketIOService.listen<TypeRoomDto[]>(TypeSocketEvent.GameFromServerGetRooms, (rooms) => {
      setRooms(rooms);
    });
    socketIOService.listen<TypeRoomStatusChangeDto>(
      TypeSocketEvent.GameFromServerRoomStatusChange,
      (roomStatusChange) => {
        navigate(`/game/${roomStatusChange.roomId}`);
      },
    );
    socketIOService.emit(TypeSocketEvent.GameFromClientGetRooms, { data: {} });
  }, [navigate]);

  const handleChangePlayerName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  };

  const handleCreateRoom = () => {
    socketIOService.emit(TypeSocketEvent.GameFromClientCreateRoom, { data: {} });
  };

  const handleJoinRoom = (roomId: string) => {
    socketIOService.emit(TypeSocketEvent.GameFromClientJoinRoom, {
      data: { roomId, playerId: playerName },
    });
  };

  return (
    <div>
      <h1 className="heading">Home Page</h1>
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
          {rooms.map((room) => (
            <li
              className={styles.roomEntry}
              key={room.roomId}
            >
              <span>room-{room.roomId}</span>
              <span>{room.status}</span>
              <span className={styles.playersSpan}>
                <svg className="feather">
                  <use href={`${featherSprite}#${room.playersCount === 1 ? 'user' : 'users'}`} />
                </svg>
                {room.playersCount}/{MAX_NUMBER_OF_PLAYERS}
              </span>
              <button
                className="btn"
                type="button"
                disabled={!playerName || room.playersCount === MAX_NUMBER_OF_PLAYERS}
                onClick={() => handleJoinRoom(room.roomId)}
              >
                join
              </button>
            </li>
          ))}
        </ul>
        <button
          className="btn"
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
