import { TypePlayer, TypePlayerStatus } from '../../../shared/types';
import { config } from '../index';

export class Popup {
  scene: Phaser.Scene;
  wrapper?: Phaser.GameObjects.Sprite;
  border?: Phaser.GameObjects.Graphics;
  title?: Phaser.GameObjects.Text;
  rectangle?: Phaser.GameObjects.Graphics;
  colors: { winner: number; loser: number };
  titleTexts: { onWin: string; onEnd: string };
  playerName?: Phaser.GameObjects.Text;
  playerText?: Phaser.GameObjects.Text;
  avatar?: Phaser.GameObjects.Sprite;
  aword?: Phaser.GameObjects.Sprite;
  alphas: { onWin: number; onEnd: number };
  depthes: { onWin: number; onEnd: number };

  constructor(scene: Phaser.Scene, players: TypePlayer[], isGameOver: boolean) {
    this.scene = scene;
    this.colors = { winner: 0x00ff00, loser: 0xee0808 };
    this.alphas = { onWin: 0.85, onEnd: 1 };
    this.depthes = { onWin: 200, onEnd: 300 };
    this.titleTexts = { onWin: 'Congrats! You are not a fool!', onEnd: 'The game is over' };

    if (!isGameOver) {
      const me = players[0];
      this.createPopup(false, me);
    } else {
      const loser = players.find((player) => player.playerStatus === TypePlayerStatus.YouLoser);
      this.createPopup(true, loser);
    }
  }

  createPopup(status: boolean, player: TypePlayer | undefined) {
    const titleText = status ? this.titleTexts.onEnd : this.titleTexts.onWin;
    const color = status ? this.colors.loser : this.colors.winner;
    const opacity = status ? this.alphas.onEnd : this.alphas.onWin;
    const zIndex = status ? this.depthes.onEnd : this.depthes.onWin;

    this.wrapper = this.scene.add
      .sprite(config.width / 2, config.height / 2 - 30, 'winWrapper')
      .setAlpha(0)
      .setDepth(zIndex)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.destroyPopup());
    this.scene.tweens.add({
      targets: this.wrapper,
      alpha: opacity,
      ease: 'Sine.easeInOut',
      duration: 500,
      onComplete: () => createContent(),
    });

    const createContent = () => {
      this.border = this.scene.add.graphics().lineStyle(4, 0xfbc82f, 1);

      this.title = this.scene.add
        .text(config.width / 2, config.height / 2 - 130, titleText, {
          color: '#fff',
          font: '30px Arial bold',
        })
        .setOrigin(0.5)
        .setDepth(zIndex + 1);

      this.rectangle = this.scene.add
        .graphics()
        .fillStyle(color, 0.6)
        .lineStyle(2, color, 1)
        .fillRoundedRect(config.width / 2 - 250, config.height / 2 - 30, 500, 100, 10)
        .strokeRoundedRect(config.width / 2 - 250, config.height / 2 - 30, 500, 100, 10)
        .setDepth(zIndex + 1);

      if (player !== undefined) {
        const text = status ? 'The fool is:' : 'The winner is:';

        this.playerText = this.scene.add
          .text(config.width / 3 + 70, config.height / 2 - 15, text, {
            color: '#fff',
            font: '25px Arial bold',
          })
          .setDepth(zIndex + 1);

        this.playerName = this.scene.add
          .text(config.width / 3 + 70, config.height / 2 + 25, player.playerName, {
            color: '#fff',
            font: '25px Arial bold',
          })
          .setDepth(zIndex + 1);

        this.avatar = this.scene.add
          .sprite(config.width / 3 - 20, config.height / 2 - 10, 'icons', player.playerAvatar)
          .setOrigin(0, 0)
          .setDepth(zIndex + 1);

        const hat = status ? 'foolscap' : 'crown';
        this.aword = this.scene.add
          .sprite(config.width / 3 + 30, config.height / 2 - 22, 'aword', hat)
          .setScale(0.8)
          .setAngle(20)
          .setDepth(zIndex + 1);
      } else {
        this.playerText = this.scene.add
          .text(config.width / 2, config.height / 2 + 15, 'Drawn game', {
            color: '#fff',
            font: '30px Arial bold',
          })
          .setOrigin(0.5)
          .setDepth(zIndex + 1);
      }
    };
  }

  destroyPopup() {
    this.wrapper?.destroy();
    this.border?.destroy();
    this.title?.destroy();
    this.rectangle?.destroy();
    this.playerText?.destroy();
    this.playerName?.destroy();
    this.avatar?.destroy();
    this.aword?.destroy();
  }
}
