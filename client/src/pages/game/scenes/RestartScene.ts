import Phaser from 'phaser';
import { config } from '../index';

export class RestartScene extends Phaser.Scene {
  constructor() {
    super('Restart');
  }

  create() {
    const bg = this.add.sprite(config.width / 2, config.height / 2, 'bgDark');
    const text = this.add
      .text(config.width / 2, config.height / 2 - 30, 'Restarting...')
      .setOrigin(0.5, 0);
    this.scene.start('Game');
  }
}
