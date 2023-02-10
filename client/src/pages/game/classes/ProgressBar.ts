import { config } from '../index';

export class ProgressBar {
  scene: Phaser.Scene;
  style: {
    wrapperColor: number;
    barColor: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  progressWrapper: Phaser.GameObjects.Graphics;
  progressBar: Phaser.GameObjects.Graphics;
  loadingText: Phaser.GameObjects.Text;
  valueText: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.style = {
      wrapperColor: 0xffffff,
      barColor: 0xffffff,
      x: config.width / 2 - 250,
      y: config.height / 2,
      width: 500,
      height: 10,
    };

    this.progressWrapper = this.scene.add.graphics();
    this.progressBar = this.scene.add.graphics();
    this.loadingText = this.scene.add
      .text(config.width / 2, config.height / 2 - 30, 'Loading')
      .setOrigin(0.5, 0);
    this.valueText = this.scene.add
      .text(config.width / 2, config.height / 2 + 30, '0%')
      .setOrigin(0.5, 0);

    this.showWrapper();
    this.setEvents();
  }

  setEvents() {
    this.scene.load.on('progress', this.showProgressBar.bind(this));
    this.scene.load.on('complete', this.onLoadComplete.bind(this));
  }

  showWrapper() {
    this.progressWrapper
      .lineStyle(1, this.style.wrapperColor, 1)
      .strokeRect(this.style.x, this.style.y, this.style.width, this.style.height);
  }

  onLoadComplete() {
    this.progressBar.destroy();
    this.progressWrapper.destroy();
    this.loadingText.destroy();
    this.valueText.destroy();
  }

  showProgressBar(value: number) {
    this.progressBar
      .clear()
      .fillStyle(this.style.barColor)
      .fillRect(this.style.x, this.style.y, this.style.width * value, this.style.height);
    this.valueText.setText(`${value * 100}%`);
  }
}
