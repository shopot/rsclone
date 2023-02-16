import { config } from '../index';

export class StatusHelper extends Phaser.GameObjects.Text {
  coordX: number;
  coordY: number;
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, '', {});
    this.scene = scene;
    this.coordX = config.playersHands[1][0].startX + config.playersHands[1][0].width;
    this.coordY = config.height - config.cardSize.h - 30;
    this.scene.add.existing(this);
    this.setStyle({
      font: '20px',
      color: '#FFFFFF',
      strokeThickness: 1,
      stroke: '#FFFFFF',
    });
  }

  setStatus(nickname: string, status: string) {
    this.setText(`${nickname} ${status}`);
    this.setPosition(this.coordX - 10, this.coordY - 5);
    this.setOrigin(1, 0);
    if (status === 'passes') {
      setTimeout(() => {
        this.setText('');
      }, 3000);
    }
  }
}
