import Phaser from 'phaser';
import cardsPng from '../../../assets/phaser/cards.png';
import cardsJson from '../../../assets/phaser/cards.json';
import iconsPng from '../../../assets/phaser/avatar.png';
import iconsJson from '../../../assets/phaser/avatar.json';
import suitsPng from '../../../assets/phaser/suits.png';
import suitsJson from '../../../assets/phaser/suits.json';
import buttonsPng from '../../../assets/phaser/buttons.png';
import buttonsJson from '../../../assets/phaser/buttons.json';
import roundPng from '../../../assets/phaser/roundbtns.png';
import roundJson from '../../../assets/phaser/roundbtns.json';
import cloudsPng from '../../../assets/phaser/clouds.png';
import cloudsJson from '../../../assets/phaser/clouds.json';
import shieldSwordPng from '../../../assets/phaser/shield_sword.png';
import shieldSwordJson from '../../../assets/phaser/shield_sword.json';
import hatPng from '../../../assets/phaser/hat.png';
import hatJson from '../../../assets/phaser/hat.json';

import bgDark from '../../../assets/phaser/bg_dark.jpg';
import bgLight from '../../../assets/phaser/bg_light.jpg';
import chatWrapperPng from '../../../assets/phaser/chatWrapper.png';
import redCircle from '../../../assets/phaser/red-circle.png';
import winWrapper from '../../../assets/phaser/win_wrapper.png';
import offline from '../../../assets/phaser/offline.png';

import cardPlacesound from '../../../assets/sounds/place_card.wav';
import loserSound from '../../../assets/sounds/loser_v1.mp3';
import fromDeckSound from '../../../assets/sounds/fromDeck.wav';
import toBeatenSound from '../../../assets/sounds/toBeaten.wav';
import newMessage from '../../../assets/sounds/newMessage.mp3';
import newPlayer from '../../../assets/sounds/newPlayer.mp3';
import playerLeft from '../../../assets/sounds/playerLeft.mp3';

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
    this.load.image('chatWrapper', chatWrapperPng);
    this.load.image('redCircle', redCircle);
    this.load.image('winWrapper', winWrapper);
    this.load.image('offline', offline);

    this.load.atlas('cards', cardsPng, cardsJson);
    this.load.atlas('buttons', buttonsPng, buttonsJson);
    this.load.atlas('roundBtns', roundPng, roundJson);
    this.load.atlas('icons', iconsPng, iconsJson);
    this.load.atlas('suits', suitsPng, suitsJson);
    this.load.atlas('clouds', cloudsPng, cloudsJson);
    this.load.atlas('shieldSword', shieldSwordPng, shieldSwordJson);
    this.load.atlas('aword', hatPng, hatJson);

    this.load.audio('placeCard', [cardPlacesound]);
    this.load.audio('loser', [loserSound]);
    this.load.audio('toBeaten', [toBeatenSound]);
    this.load.audio('fromDeck', [fromDeckSound]);
    this.load.audio('newMessage', [newMessage]);
    this.load.audio('newPlayer', [newPlayer]);
    this.load.audio('playerLeft', [playerLeft]);

    this.load.html('formHtml', 'form.html');
  }

  create() {
    this.scene.start('Game');
  }
}
