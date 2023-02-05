export class Nickname extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, style = {}) {
    super(scene, x, y, text, style);
    this.scene = scene;
    this.scene.add.existing(this);
    this.setStyle({
      font: '20px',
      color: '#FFFFFF',
      strokeThickness: 1,
      stroke: '#FFFFFF',
    });
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      ease: 'Linear',
      duration: 5,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          ease: 'Linear',
          duration: 500,
        });
      },
    });
  }
}
