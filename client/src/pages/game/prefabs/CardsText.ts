export class CardsText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, textData: { x: number; y: number; amount: string }, style = {}) {
    super(scene, textData.x, textData.y, textData.amount, style);
    this.scene = scene;
    this.scene.add.existing(this);
    this.setStyle({
      font: '30px bold',
      color: '#ffbf00',
      strokeThickness: 4,
      stroke: '#000000',
    });
  }
}
