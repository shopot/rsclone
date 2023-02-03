export class Icon extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, atlas: string, texture: string) {
    super(scene, x, y, atlas, texture);
    this.scene = scene;
    this.scene.add.existing(this);
    this.setScale(0.3);
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      ease: 'Linear',
      duration: 50,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          scaleX: 0.3,
          ease: 'Linear',
          duration: 500,
        });
      },
    });
  }
}
