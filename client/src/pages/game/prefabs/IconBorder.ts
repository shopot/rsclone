export class IconBorder extends Phaser.GameObjects.Graphics {
  params: { x: number; y: number; width: number; height: number; rounded: number };
  colors: { active: number; inactive: number };
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
    this.params = { x: x, y: y, width: width, height: height, rounded: rounded };
    this.colors = { active: 0x00ff00, inactive: 0x606060 };
    this.scene.add.existing(this);
    this.createBorder(false);
  }

  createBorder(status: boolean) {
    this.clear();
    const color = status ? this.colors.active : this.colors.inactive;
    const { x, y, width, height, rounded } = this.params;
    this.lineStyle(4, color, 1).strokeRoundedRect(x, y, width, height, rounded);
  }
}
