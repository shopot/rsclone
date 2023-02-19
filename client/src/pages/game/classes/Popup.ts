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

  text?: Phaser.GameObjects.Text;
  loserText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, players: TypePlayer[], isGameOver: boolean) {
    this.scene = scene;
    this.colors = { winner: 0x00ff00, loser: 0xee0808 };
    this.titleTexts = { onWin: 'Congrats! You are not a fool!', onEnd: 'The game is over' };

    if (!isGameOver) {
      const me = players[0];
      this.createPopup(false, me);
    } else {
      const loser = players.find((player) => player.playerStatus === TypePlayerStatus.YouLoser);
      this.createPopup(true, loser);
    }
  }

  onEnd(players: TypePlayer[]) {
    const loser = players.find((player) => player.playerStatus === TypePlayerStatus.YouLoser);

    if (loser) {
      //добавить картинку с колпаком на  аватарке лузера
      this.text = this.scene.add
        .text(config.width / 2, config.height / 2 - 30, 'The loser is', {
          color: '#fff',
          font: '25px Arial bold',
        })
        .setOrigin(0.5)
        .setDepth(201);
      this.loserText = this.scene.add
        .text(config.width / 2, config.height / 2 + 70, `${loser.playerName}`, {
          color: '#fff',
          font: '30px Arial bold',
        })
        .setOrigin(0.5)
        .setDepth(201);
    } else {
      this.text = this.scene.add
        .text(config.width / 2, config.height / 2 - 30, 'drawn game', {
          color: '#fff',
          font: '25px Arial bold',
        })
        .setOrigin(0.5)
        .setDepth(201);
    }
  }

  createPopup(status: boolean, player: TypePlayer | undefined) {
    const titleText = status ? this.titleTexts.onEnd : this.titleTexts.onWin;
    const color = status ? this.colors.loser : this.colors.winner;

    this.wrapper = this.scene.add
      .sprite(config.width / 2, config.height / 2 - 30, 'winWrapper')
      .setAlpha(0.85)
      .setDepth(200)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.destroyPopup());

    this.border = this.scene.add.graphics().lineStyle(4, 0xfbc82f, 1);

    this.title = this.scene.add
      .text(config.width / 2, config.height / 2 - 130, titleText, {
        color: '#fff',
        font: '30px Arial bold',
      })
      .setOrigin(0.5)
      .setDepth(201);

    this.rectangle = this.scene.add
      .graphics()
      .fillStyle(color, 0.6)
      .lineStyle(2, color, 1)
      .fillRoundedRect(config.width / 2 - 250, config.height / 2 - 30, 500, 100, 10)
      .strokeRoundedRect(config.width / 2 - 250, config.height / 2 - 30, 500, 100, 10)
      .setDepth(201);

    if (player !== undefined) {
      const text = status ? 'The fool is:' : 'The winner is:';

      this.playerText = this.scene.add
        .text(config.width / 3 + 70, config.height / 2 - 15, text, {
          color: '#fff',
          font: '25px Arial bold',
        })
        .setDepth(201);

      this.playerName = this.scene.add
        .text(config.width / 3 + 70, config.height / 2 + 25, player.playerName, {
          color: '#fff',
          font: '25px Arial bold',
        })
        .setDepth(201);

      this.avatar = this.scene.add
        .sprite(config.width / 3 - 20, config.height / 2 - 10, 'icons', player.playerAvatar)
        .setOrigin(0, 0)
        .setDepth(201);

      const hat = status ? 'foolscap' : 'crown';
      this.aword = this.scene.add
        .sprite(config.width / 3 + 30, config.height / 2 - 22, 'aword', hat)
        .setScale(0.8)
        .setAngle(20)
        .setDepth(201);
    } else {
      this.playerText = this.scene.add
        .text(config.width / 3 + 70, config.height / 2 - 15, 'drawn game', {
          color: '#fff',
          font: '30px Arial bold',
        })
        .setDepth(201);
    }
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
