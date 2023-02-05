import { config } from '../index';

type TableParams = {
  x: number;
  y: number;
  width: number;
  height: number;
  rounded: { tl: number; tr: number; bl: number; br: number };
};

export class Table extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene, params: TableParams) {
    super(scene);
    this.scene = scene;

    this.scene.add.existing(this);
    this.fillRoundedRect(params.x, params.y, params.width, params.height, params.rounded)
      .strokeRoundedRect(params.x, params.y, params.width, params.height, params.rounded)
      .fillStyle(config.tableColor[0], 0.6)
      .lineStyle(0.5, config.tableBorderColor[0], 0.5);
  }
}
