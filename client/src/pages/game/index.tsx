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
    socket.emit('fromClientCreatePlayer', { data: { playerId: playerName } });
  };

  const handleSendMessage = () => {
    socket.emit('fromClientChatMessage', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot', chatMessage: message },
    });
  };

  const handleJoinGame = () => {
    socket.emit('fromClientJoinRoom', { data: { roomId: 'k8Ne3Q05', playerId: 'testbot' } });
  };

  const handleLeaveRoom = () => {
    socket.emit('fromClientLeaveRoom', { data: { roomId: 'k8Ne3Q05', playerId: 'testbot' } });
  };

  const handleStartGame = () => {
    socket.emit('fromClientStartGame', { data: { roomId: 'k8Ne3Q05', playerId: 'testbot' } });
  };

  const handleAttack = () => {
    socket.emit('fromClientAttackerOpen', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot', card: { rank: 7, suit: 'hearts' } },
    });
  };

  const handlePass = () => {
    socket.emit('fromClientAttackerPass', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot' },
    });
  };

  const handleDefence = () => {
    socket.emit('fromClientDefenderClose', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot', card: { rank: 7, suit: 'hearts' } },
    });
  };

  const handleTake = () => {
    socket.emit('fromClientDefenderTake', {
      data: { roomId: 'k8Ne3Q05', playerId: 'testbot' },
    });
  };

  const handleSettings = () => {
    socket.emit('fromClientHandleSettings', { data: { playerId: 'testbot' } });
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
        <div className={styles.miscButtons}>
          <button
            className="btn"
            type="button"
            onClick={handleJoinGame}
          >
            Join game
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
