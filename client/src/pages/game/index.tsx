import React, { useState } from 'react';
import { io } from 'socket.io-client';
import styles from './styles.m.scss';

const GamePage = () => {
  const socket = io('http://localhost:3000');
  const [playerName, setPlayerName] = useState('');
  const [message, setMessage] = useState('');

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const handleMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleCreatePlayer = () => {
    socket.emit('gameFromClientCreatePlayer', { data: { playerId: playerName } });
  };

  const handleSendMessage = () => {
    socket.emit('gameFromClientChatMessage', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot', chatMessage: message },
    });
  };

  const handleJoinGame = () => {
    socket.emit('gameFromClientJoinRoom', { data: { roomId: 'k8Ne3Q05', playerId: 'testbot' } });
  };

  const handleLeaveRoom = () => {
    socket.emit('gameFromClientLeaveRoom', { data: { roomId: 'k8Ne3Q05', playerId: 'testbot' } });
  };

  const handleStartGame = () => {
    socket.emit('gameFromClientStartGame', { data: { roomId: 'k8Ne3Q05', playerId: 'testbot' } });
  };

  const handleAttack = () => {
    socket.emit('gameFromClientAttackerOpen', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot', card: { rank: 7, suit: 'hearts' } },
    });
  };

  const handlePass = () => {
    socket.emit('gameFromClientAttackerPass', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot' },
    });
  };

  const handleDefence = () => {
    socket.emit('gameFromClientDefenderClose', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot', card: { rank: 7, suit: 'hearts' } },
    });
  };

  const handleTake = () => {
    socket.emit('gameFromClientDefenderTake', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot' },
    });
  };

  const handleSettings = () => {
    socket.emit('gameFromClientHandleSettings', { data: { playerId: 'testbot' } });
  };

  return (
    <div>
      <h1>Game Page</h1>
      <div className="addPlayer">
        <input
          type="text"
          value={playerName}
          placeholder="Name of the player"
          onChange={handlePlayerNameChange}
        />
        <button
          type="button"
          onClick={handleCreatePlayer}
        >
          Add player
        </button>
      </div>
      <div className="chat">
        <input
          type="text"
          value={message}
          placeholder="message"
          onChange={handleMessage}
        />
        <button
          type="button"
          onClick={handleSendMessage}
        >
          Send message
        </button>
      </div>
      <div className={styles['misc-buttons']}>
        <button
          type="button"
          onClick={handleJoinGame}
        >
          Join game
        </button>
        <button
          type="button"
          onClick={handleLeaveRoom}
        >
          Leave Room
        </button>
        <button
          type="button"
          onClick={handleStartGame}
        >
          Start game
        </button>
        <button
          type="button"
          onClick={handleAttack}
        >
          Make attacking move
        </button>
        <button
          type="button"
          onClick={handlePass}
        >
          Pass
        </button>
        <button
          type="button"
          onClick={handleDefence}
        >
          Make defending move
        </button>
        <button
          type="button"
          onClick={handleTake}
        >
          Take
        </button>
        <button
          type="button"
          onClick={handleSettings}
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default GamePage;
