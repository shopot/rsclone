import { config } from '../index';

export class Table extends Phaser.GameObjects.Graphics {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    rounded: { tl: number; tr: number; bl: number; br: number },
  ) {
    super(scene);
    this.scene = scene;
    this.scene.add.existing(this);
    this.lineStyle(2, +config.backgroundColor, 1)
      .fillStyle(+config.backgroundColor, 0.3)
      .fillRoundedRect(x, y, width, height, rounded);
  }
}
