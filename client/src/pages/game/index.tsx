import React, { useRef } from 'react';
import { useGame } from '../../app/hooks/useGame';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

export const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '0x000000',
  tableColor: [0x000000, 0x00ff00],
  tableBorderColor: [0xffff00, 0x00ff00],
  parent: 'game-content',
  cardSize: { w: 150 * 0.7, h: 225 * 0.7 },
  scene: [BootScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  icons: ['Dali', 'Earring', 'Frida', 'Mona', 'Peach', 'Unknown'],
  suits: ['club', 'diamond', 'heart', 'spade'],
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
  placesForAttack: {
    3: [
      { x: 1280 * 0.3, y: 720 / 2 - 50, scale: 0.9 },
      { x: 1280 * 0.5, y: 720 / 2 - 50, scale: 0.9 },
      { x: 1280 * 0.7, y: 720 / 2 - 50, scale: 0.9 },
    ],
    6: [
      { x: 1280 * 0.3, y: 720 / 2 - 120, scale: 0.6 },
      { x: 1280 * 0.5, y: 720 / 2 - 120, scale: 0.6 },
      { x: 1280 * 0.7, y: 720 / 2 - 120, scale: 0.6 },
      { x: 1280 * 0.3, y: 720 / 2 + 60, scale: 0.6 },
      { x: 1280 * 0.5, y: 720 / 2 + 60, scale: 0.6 },
      { x: 1280 * 0.7, y: 720 / 2 + 60, scale: 0.6 },
    ],
    12: [
      { x: 1280 * 0.25, y: 720 / 2 - 120, scale: 0.6 },
      { x: 1280 * 0.37, y: 720 / 2 - 120, scale: 0.6 },
      { x: 1280 * 0.49, y: 720 / 2 - 120, scale: 0.6 },
      { x: 1280 * 0.61, y: 720 / 2 - 120, scale: 0.6 },
      { x: 1280 * 0.73, y: 720 / 2 - 120, scale: 0.6 },
      { x: 1280 * 0.85, y: 720 / 2 - 120, scale: 0.6 },
      { x: 1280 * 0.25, y: 720 / 2 + 60, scale: 0.6 },
      { x: 1280 * 0.37, y: 720 / 2 + 60, scale: 0.6 },
      { x: 1280 * 0.49, y: 720 / 2 + 60, scale: 0.6 },
      { x: 1280 * 0.61, y: 720 / 2 + 60, scale: 0.6 },
      { x: 1280 * 0.73, y: 720 / 2 + 60, scale: 0.6 },
      { x: 1280 * 0.85, y: 720 / 2 + 60, scale: 0.6 },
    ],
  },
  placesForDefend: {
    3: [
      { x: 1280 * 0.3 + 50, y: 720 / 2 + 30, scale: 0.9 },
      { x: 1280 * 0.5 + 50, y: 720 / 2 + 30, scale: 0.9 },
      { x: 1280 * 0.7 + 50, y: 720 / 2 + 30, scale: 0.9 },
    ],
    6: [
      { x: 1280 * 0.3 + 50, y: 720 / 2 - 10, scale: 0.6 },
      { x: 1280 * 0.5 + 50, y: 720 / 2 - 10, scale: 0.6 },
      { x: 1280 * 0.7 + 50, y: 720 / 2 - 10, scale: 0.6 },
      { x: 1280 * 0.3 + 50, y: 720 / 2 + 90, scale: 0.6 },
      { x: 1280 * 0.5 + 50, y: 720 / 2 + 90, scale: 0.6 },
      { x: 1280 * 0.7 + 50, y: 720 / 2 + 90, scale: 0.6 },
    ],
    12: [
      { x: 1280 * 0.25 + 50, y: 720 / 2 - 10, scale: 0.6 },
      { x: 1280 * 0.37 + 50, y: 720 / 2 - 10, scale: 0.6 },
      { x: 1280 * 0.49 + 50, y: 720 / 2 - 10, scale: 0.6 },
      { x: 1280 * 0.61 + 50, y: 720 / 2 - 10, scale: 0.6 },
      { x: 1280 * 0.73 + 50, y: 720 / 2 - 10, scale: 0.6 },
      { x: 1280 * 0.85 + 50, y: 720 / 2 - 10, scale: 0.6 },
      { x: 1280 * 0.25 + 50, y: 720 / 2 + 90, scale: 0.6 },
      { x: 1280 * 0.37 + 50, y: 720 / 2 + 90, scale: 0.6 },
      { x: 1280 * 0.49 + 50, y: 720 / 2 + 90, scale: 0.6 },
      { x: 1280 * 0.61 + 50, y: 720 / 2 + 90, scale: 0.6 },
      { x: 1280 * 0.73 + 50, y: 720 / 2 + 90, scale: 0.6 },
      { x: 1280 * 0.85 + 50, y: 720 / 2 + 90, scale: 0.6 },
    ],
  },
  playersTables: {
    1: [
      {
        width: 1280 * 0.6,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.2,
      },
    ],
    2: [
      {
        width: 1280 * 0.6,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.2,
      },
      {
        width: 1280 * 0.3,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.35,
      },
    ],
    3: [
      {
        width: 1280 * 0.6,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.2,
      },
      {
        width: 1280 * 0.3,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.15,
      },
      {
        width: 1280 * 0.3,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.65,
      },
    ],
    4: [
      {
        width: 1280 * 0.6,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.2,
      },
      {
        width: 1280 * 0.2,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.15,
      },
      {
        width: 1280 * 0.2,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.45,
      },
      {
        width: 1280 * 0.2,
        height: 225 * 0.7 + 8,
        startX: 1280 * 0.75,
      },
    ],
  },
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
