import { config } from '../index';

export class Timer extends Phaser.GameObjects.Text {
  counter: number;
  clock: Phaser.Time.TimerEvent;
  constructor(scene: Phaser.Scene, hand: { width: number; height: number; startX: number }) {
    super(scene, hand.startX + hand.width / 2, config.height - config.cardSize.h - 35, '', {
      font: '20px Signika',
      color: '#FFFFFF',
      strokeThickness: 1,
      stroke: '#FFFFFF',
    });
    this.scene = scene;
    this.scene.add.existing(this);

    this.counter = 0;
    this.clock = this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.counter++;
        const mins = Math.floor(this.counter / 60);
        const minsText = mins < 10 ? `0${mins}` : `${mins}`;
        const secs = this.counter - mins * 60;
        const secsText = secs < 10 ? `0${secs}` : `${secs}`;
        this.setText(`Time: ${minsText}: ${secsText}`).setOrigin(0.5, 0);
      },
      callbackScope: this,
      loop: true,
    });
  }

  stopTimer() {
    this.clock.remove();
    this.destroy();
  }
}
