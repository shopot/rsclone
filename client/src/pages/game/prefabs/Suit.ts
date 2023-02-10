import { config } from '../index';

export class Suit extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, frame: string) {
    super(scene, 80, config.height / 2 - 10, 'suits', frame);
    // this.scene = scene;
    this.scene.add.existing(this);
    this.setScale(0.25);
    this.depth = config.depth.suit;
  }
}
