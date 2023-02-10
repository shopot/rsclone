import Phaser from 'phaser';
import { config } from '../index';

export class EndScene extends Phaser.Scene {
  constructor() {
    super('End');
  }

  create() {
    const bg = this.add.sprite(config.width / 2, config.height / 2, 'bgDark');
    const text = this.add
      .text(config.width / 2, config.height / 2 - 30, 'Leaving...')
      .setOrigin(0.5, 0);
    window.location.href = '/';
  }
}
