import React, { useRef } from 'react';
import { useGame } from '../../app/hooks/useGame';
import { PlayGame } from './scenes/PlayGame';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: 0xccfbf1,
  parent: 'game-content',
  scene: [PlayGame],
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
