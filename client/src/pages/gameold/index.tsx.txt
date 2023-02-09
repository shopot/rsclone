import React, { useEffect, useState } from 'react';
import { TypeSocketEvent } from '../../shared/types/TypeSocketEvent';
import { socketIOService } from '../../shared/api/socketio';
import { ICardDto } from '../../shared/interfaces/ICardDto';
import { TypeCardRank } from '../../shared/types/TypeCardRank';
import { TypeCardSuit } from '../../shared/types/TypeCardSuit';
import { TypeRoomStatus } from '../../shared/types/TypeRoomStatus';
import styles from './styles.m.scss';

socketIOService.listen(TypeSocketEvent.GameFromServerChatMessage, (data) => {
  console.log('gameFromServerChatMessage', data);
});

socketIOService.listen(TypeSocketEvent.GameFromServerRoomStatusChange, (data) => {
  console.log('gameFromServerRoomStatusChange', data);
});

type TypeEventPayload = {
  playerId: string;
  roomId?: string;
  chatMessage?: string;
  card?: ICardDto;
};

type TypeRoomListPayload = {
  roomId: string;
  playersCount: number;
  status: TypeRoomStatus;
};

const GamePage = () => {
  const [playerName, setPlayerName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [rooms, setRooms] = useState<TypeRoomListPayload[]>([]);

  useEffect(() => {
    socketIOService.listen<TypeRoomListPayload[]>(
      TypeSocketEvent.GameFromServerGetRooms,
      (rooms) => {
        if (!selectedRoom && rooms.length > 0) {
          setSelectedRoom(rooms[0].roomId);
        }
        setRooms(rooms);
      },
    );
  }, [selectedRoom]);

  useEffect(() => {
    socketIOService.listen(TypeSocketEvent.GameFromServerDealtCardsToPlayers, (data) => {
      console.log(data);
    });
  }, []);

  useEffect(() => {
    socketIOService.emit(TypeSocketEvent.GameFromClientGetRooms, { data: {} });
  }, []);

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const handleMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleCreatePlayer = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientCreatePlayer, {
      data: { playerId: playerName },
    });
  };

  const handleSendMessage = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientChatMessage, {
      data: { roomId: selectedRoom, playerId: playerName, chatMessage: message },
    });
  };

  const handleJoinRoom = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientJoinRoom, {
      data: { roomId: selectedRoom, playerId: playerName },
    });
  };

  const handleCreateGame = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientCreateRoom, {
      data: { playerId: playerName },
    });
  };

  const handleLeaveRoom = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientLeaveRoom, {
      data: { roomId: selectedRoom, playerId: playerName },
    });
  };

  const handleStartGame = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientStartGame, {
      data: { roomId: selectedRoom, playerId: playerName },
    });
  };

  const handleRestartGame = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientRestartGame, {
      data: { roomId: selectedRoom, playerId: playerName },
    });
  };

  const handleOpenRoom = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientOpenRoom, {
      data: { roomId: selectedRoom, playerId: playerName },
    });
  };

  const handleAttack = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientAttackerOpen, {
      data: {
        roomId: selectedRoom,
        playerId: playerName,
        card: { rank: TypeCardRank.RANK_Q, suit: TypeCardSuit.Diamonds },
      },
    });
  };

  const handlePass = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientAttackerPass, {
      data: { roomId: selectedRoom, playerId: playerName },
    });
  };

  const handleDefence = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientDefenderClose, {
      data: {
        roomId: selectedRoom,
        playerId: playerName,
        card: { rank: TypeCardRank.RANK_8, suit: TypeCardSuit.Hearts },
      },
    });
  };

  const handleTake = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientDefenderTake, {
      data: { roomId: selectedRoom, playerId: playerName },
    });
  };

  const handleSettings = () => {
    socketIOService.emit<TypeEventPayload>(TypeSocketEvent.GameFromClientSettings, {
      data: { playerId: playerName },
    });
  };

  return (
    <div>
      <h1 className="heading">Game Page</h1>
      <div className={styles.buttonsDiv}>
        <div className={styles.addPlayer}>
          <input
            type="text"
            value={playerName}
            placeholder="Name of the player"
            onChange={handlePlayerNameChange}
          />
          <button
            className="btn"
            type="button"
            onClick={handleCreatePlayer}
          >
            Add player
          </button>
        </div>
        <div className={styles.chat}>
          <input
            type="text"
            value={message}
            placeholder="Chat message"
            onChange={handleMessage}
          />
          <button
            className="btn"
            type="button"
            onClick={handleSendMessage}
          >
            Send message
          </button>
        </div>
        <div className={styles.joinRoom}>
          <select
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(e.target.value);
            }}
          >
            {rooms.map((room) => (
              <option
                key={room.roomId}
                value={room.roomId}
              >
                {room.roomId} {room.playersCount} {room.status}
              </option>
            ))}
          </select>
          <button
            className="btn"
            type="button"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleStartGame}
          >
            Start game
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleRestartGame}
          >
            Restart game
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleOpenRoom}
          >
            Open room
          </button>
        </div>
        <div className={styles.miscButtons}>
          <button
            className="btn"
            type="button"
            onClick={handleCreateGame}
          >
            Create game
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleAttack}
          >
            Make attacking move
          </button>
          <button
            className="btn"
            type="button"
            onClick={handlePass}
          >
            Pass
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleDefence}
          >
            Make defending move
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleTake}
          >
            Take
          </button>
          <button
            className="btn"
            type="button"
            onClick={handleSettings}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
