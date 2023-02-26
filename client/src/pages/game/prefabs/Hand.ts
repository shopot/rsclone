import { config } from '../index';

type HandParams = {
  x: number;
  y: number;
  width: number;
  height: number;
  rounded: { tl: number; tr: number; bl: number; br: number };
};

export class Hand extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene, params: HandParams) {
    const { x, y, width, height, rounded } = params;
    super(scene);
    this.scene = scene;

    this.fillStyle(config.tableColor[0], 0.6)
      .lineStyle(0.5, config.tableBorderColor[0], 0.5)
      .fillRoundedRect(x, y, width, height, rounded)
      .strokeRoundedRect(x, y, width, height, rounded);

    this.scene.add.existing(this);
  }
}
