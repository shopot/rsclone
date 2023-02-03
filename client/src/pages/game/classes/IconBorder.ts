export class IconBorder extends Phaser.GameObjects.Graphics {
  width: number;
  coordX: number;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    rounded: number,
  ) {
    super(scene);
    this.scene = scene;
    this.coordX = x;
    this.width = width;
    this.scene.add.existing(this);
    this.lineStyle(4, 0x606060, 1).strokeRoundedRect(x, y, width, height, rounded);
  }

  makeActive() {
    this.lineStyle(4, 0x00ff00, 1);
  }

  makeInactive() {
    this.lineStyle(4, 0x606060, 1);
  }
}
