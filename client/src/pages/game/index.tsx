import React, { useRef } from 'react';
import { useGame } from '../../app/hooks/useGame';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

export const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#4682B4',
  parent: 'game-content',
  scene: [BootScene, GameScene],
  cardNames: [
    '6C',
    '6D',
    '6H',
    '6S',
    '7C',
    '7D',
    '7H',
    '7S',
    '8C',
    '8D',
    '8H',
    '8S',
    '9C',
    '9D',
    '9H',
    '9S',
    '10C',
    '10D',
    '10H',
    '10S',
    'AC',
    'AD',
    'AH',
    'AS',
    'JC',
    'JD',
    'JH',
    'JS',
    'KC',
    'KD',
    'KH',
    'KS',
    'QC',
    'QD',
    'QH',
    'QS',
  ],
};

const GamePage = () => {
  const gameContainer = useRef<HTMLDivElement>(null);
  useGame(config, gameContainer);

  return (
    <div>
      <h1>Game Page</h1>
      <div ref={gameContainer}></div>
    </div>
  );
};

export default GamePage;
