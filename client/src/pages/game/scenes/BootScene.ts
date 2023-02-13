import Phaser from 'phaser';
import cardsPng from '../../../assets/sprites/cards.png';
import cardsJson from '../../../assets/sprites/cards.json';
import iconsPng from '../../../assets/sprites/avatar.png';
import iconsJson from '../../../assets/sprites/avatar.json';
import suitsPng from '../../../assets/sprites/suits.png';
import suitsJson from '../../../assets/sprites/suits.json';
import buttonsPng from '../../../assets/sprites/buttons.png';
import buttonsJson from '../../../assets/sprites/buttons.json';
import bgDark from '../../../assets/sprites/bg_dark.jpg';
import bgLight from '../../../assets/sprites/bg_light.jpg';
import { ProgressBar } from '../classes/ProgressBar';
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    const progressBar = new ProgressBar(this);
    this.preloadAssets();
  }

  preloadAssets() {
    this.load.image('bgDark', bgDark);
    this.load.image('bgLight', bgLight);
    this.load.atlas('cards', cardsPng, cardsJson);
    this.load.atlas('buttons', buttonsPng, buttonsJson);
    this.load.atlas('icons', iconsPng, iconsJson);
    this.load.atlas('suits', suitsPng, suitsJson);
    // audio
  }

  create() {
    this.scene.start('Game');
  }
}
