export class Nickname extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, style = {}) {
    super(scene, x, y, text, style);
    this.scene = scene;
    this.scene.add.existing(this);
    this.setStyle({
      font: '20px Signika',
      color: '#FFFFFF',
      strokeThickness: 1,
      stroke: '#FFFFFF',
    });
  }
}
