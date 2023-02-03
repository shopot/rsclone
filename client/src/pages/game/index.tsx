import React, { useState } from 'react';
import { io } from 'socket.io-client';
import styles from './styles.m.scss';

const socket = io('http://localhost:3000');
socket.on('gameFromServerChatMessage', (data) => {
  console.log('gameFromServerChatMessage', data);
});

const GamePage = () => {
  const [playerName, setPlayerName] = useState('');
  const [message, setMessage] = useState('');
  const [roomName, setRoomName] = useState('');

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const handleMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const handleCreatePlayer = () => {
    socket.emit('gameFromClientCreatePlayer', { data: { playerId: playerName } });
  };

  const handleSendMessage = () => {
    socket.emit('gameFromClientChatMessage', {
      data: { roomId: roomName, playerId: playerName, chatMessage: message },
    });
  };

  const handleJoinRoom = () => {
    socket.emit('gameFromClientJoinRoom', {
      data: { roomId: roomName, playerId: playerName },
    });
  };

  const handleCreateGame = () => {
    socket.emit('gameFromClientCreateRoom', { data: { playerId: playerName } });
  };

  const handleLeaveRoom = () => {
    socket.emit('gameFromClientLeaveRoom', { data: { roomId: roomName, playerId: playerName } });
  };

  const handleStartGame = () => {
    socket.emit('gameFromClientStartGame', { data: { roomId: roomName, playerId: playerName } });
  };

  const handleAttack = () => {
    socket.emit('gameFromClientAttackerOpen', {
      data: { roomId: 'k8Ne3Q05', playerId: playerName, card: { rank: 7, suit: 'hearts' } },
    });
  };

  const handlePass = () => {
    socket.emit('gameFromClientAttackerPass', {
      data: { roomId: 'k8Ne3Q05', playerId: playerName },
    });
  };

  const handleDefence = () => {
    socket.emit('gameFromClientDefenderClose', {
      data: { roomId: 'k8Ne3Q05', playerId: playerName, card: { rank: 7, suit: 'hearts' } },
    });
  };

  const handleTake = () => {
    socket.emit('gameFromClientDefenderTake', {
      data: { roomId: 'k8Ne3Q05', playerId: playerName },
    });
  };

  const handleSettings = () => {
    socket.emit('gameFromClientSettings', { data: { playerId: playerName } });
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
          <input
            type="text"
            value={roomName}
            placeholder="Name of the room"
            onChange={handleRoomNameChange}
          />
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
