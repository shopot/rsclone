import Phaser from 'phaser';
import cardsPng from '../../../assets/sprites/cards.png';
import cardsJson from '../../../assets/sprites/cards.json';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // loading bar
    this.load.atlas('cards', cardsPng, cardsJson);
    // audio
  }

  create() {
    this.scene.start('Game');
  }
}
