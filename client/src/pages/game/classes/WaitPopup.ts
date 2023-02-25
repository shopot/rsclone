import { config } from '../index';

export class WaitPopup {
  scene: Phaser.Scene;
  text: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, isHost: boolean, playersAmt: number) {
    this.scene = scene;

    const content = !isHost
      ? 'Please wait until host starts the game'
      : isHost && playersAmt === 1
      ? 'Please wait for other players to join'
      : isHost && playersAmt === 4
      ? 'You can start the game now'
      : 'You can start the game now or wait for more players to join';
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
