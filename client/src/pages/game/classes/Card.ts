import Phaser from 'phaser';
import { config } from '../index';

export class Card extends Phaser.GameObjects.Sprite {
  value: string;
  constructor(scene: Phaser.Scene, x: number, y: number, atlas = 'cards', value: string) {
    super(scene, x, y, atlas, 'cardBack');
    this.scene = scene;
    this.value = value;
    this.init();
  }
  init() {
    this.scene.add.existing(this);
    this.setScale(0.7);
  }

  open() {
    this.setTexture('cards', this.value);
  }

  positionTrump() {
    this.setAngle(100);
    this.open();
    this.depth = -1;
    this.scene.tweens.add({
      targets: this,
      x: 115,
      y: config.height / 2 + 5,
      ease: 'Linear',
      delay: 300,
      duration: 500,
    });
  }

  move(attack: boolean, pile: number) {
    const placesAttack = [
      { x: config.width * 0.3, y: config.height / 2 - 50 },
      { x: config.width * 0.5, y: config.height / 2 - 50 },
      { x: config.width * 0.7, y: config.height / 2 - 50 },
    ];
    const placesDefend = [
      { x: config.width * 0.3 + 50, y: config.height / 2 + 30 },
      { x: config.width * 0.5 + 50, y: config.height / 2 + 30 },
      { x: config.width * 0.7 + 50, y: config.height / 2 + 30 },
    ];

    if (attack) {
      this.scene.tweens.add({
        targets: this,
        x: placesAttack[pile - 1].x,
        y: placesAttack[pile - 1].y,
        scale: 0.9,
        ease: 'Linear',
        duration: 300,
        angle: -15,
      });
    } else {
      this.scene.tweens.add({
        targets: this,
        x: placesDefend[pile - 1].x,
        y: placesDefend[pile - 1].y,
        scale: 0.9,
        ease: 'Linear',
        duration: 300,
        angle: -5,
      });
    }
  }
}
