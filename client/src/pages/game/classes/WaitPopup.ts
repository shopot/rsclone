import { config } from '../index';

export class WaitPopup {
  scene: Phaser.Scene;
  text: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, isHost: boolean) {
    this.scene = scene;

    const content = isHost
      ? 'Please wait for other players to join'
      : 'Please wait until host starts the game';
    this.text = this.scene.add
      .text(config.width / 2, config.height / 2 - 50, content, {
        color: '#fff',
        font: '35px Signika',
      })
      .setOrigin(0.5);
  }

  destroy() {
    this.text.destroy();
  }
}
