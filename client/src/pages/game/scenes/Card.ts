import Phaser from 'phaser';

export class Card extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, value: string) {
    super(scene, 0, 0, 'cardBack');
    this.scene = scene;
    // this.value = value;
    this.scene.add.existing(this);
    this.setInteractive();
    // this.opened = false;
  }
}
