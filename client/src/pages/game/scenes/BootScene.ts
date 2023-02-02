import Phaser from 'phaser';
import cardsPng from '../../../assets/sprites/cards.png';
import cardsJson from '../../../assets/sprites/cards.json';
import iconsPng from '../../../assets/sprites/icons.png';
import iconsJson from '../../../assets/sprites/icons.json';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // loading bar
    this.load.atlas('cards', cardsPng, cardsJson);
    this.load.atlas('icons', iconsPng, iconsJson);
    // audio
  }

  create() {
    this.scene.start('Game');
  }
}
