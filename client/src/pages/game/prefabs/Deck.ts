import { config } from '../index';

export class Deck extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'cardBack');
    this.scene = scene;
    // this.value = value;
    this.scene.add.existing(this);
    // this.setInteractive();
    // this.opened = false;
    //temporary using random

    // for (let i = 0; i < 5; i++) {
    //   this.add
    //     .sprite(70 - i / 2, config.height / 2 - i, 'cards', 'cardBack')
    //     .setAngle(10)
    //     .setScale(config.scaleCards);
    // }
  }
}
