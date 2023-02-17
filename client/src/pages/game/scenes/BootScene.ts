import Phaser from 'phaser';
import cardsPng from '../../../assets/sprites/cards.png';
import cardsJson from '../../../assets/sprites/cards.json';
import iconsPng from '../../../assets/sprites/avatar.png';
import iconsJson from '../../../assets/sprites/avatar.json';
import suitsPng from '../../../assets/sprites/suits.png';
import suitsJson from '../../../assets/sprites/suits.json';
import buttonsPng from '../../../assets/sprites/buttons.png';
import buttonsJson from '../../../assets/sprites/buttons.json';
import roundPng from '../../../assets/sprites/roundbtns.png';
import roundJson from '../../../assets/sprites/roundbtns.json';
import cloudsPng from '../../../assets/sprites/clouds.png';
import cloudsJson from '../../../assets/sprites/clouds.json';
import bgDark from '../../../assets/sprites/bg_dark.jpg';
import bgLight from '../../../assets/sprites/bg_light.jpg';
import cardPlacesound from '../../../assets/sounds/place_card.wav';
import loserSound from '../../../assets/sounds/loser_v1.mp3';
import fromDeckSound from '../../../assets/sounds/fromDeck.wav';
import toBeatenSound from '../../../assets/sounds/toBeaten.wav';
import { ProgressBar } from '../classes/ProgressBar';
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    new ProgressBar(this);
    this.preloadAssets();
  }

  preloadAssets() {
    this.load.image('bgDark', bgDark);
    this.load.image('bgLight', bgLight);
    this.load.atlas('cards', cardsPng, cardsJson);
    this.load.atlas('buttons', buttonsPng, buttonsJson);
    this.load.atlas('roundBtns', roundPng, roundJson);
    this.load.atlas('icons', iconsPng, iconsJson);
    this.load.atlas('suits', suitsPng, suitsJson);
    this.load.atlas('clouds', cloudsPng, cloudsJson);

    this.load.audio('placeCard', [cardPlacesound]);
    this.load.audio('loser', [loserSound]);
    this.load.audio('toBeaten', [toBeatenSound]);
    this.load.audio('fromDeck', [fromDeckSound]);

    this.load.html('formHtml', 'form.html');
  }

  create() {
    this.scene.start('Game');
  }
}
