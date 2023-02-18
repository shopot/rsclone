import { TypePlayer, TypePlayerStatus } from '../../../shared/types';
import { config } from '../index';

export class Popup {
  scene: Phaser.Scene;
  wrapper: Phaser.GameObjects.Sprite;
  congrats?: Phaser.GameObjects.Text;
  text?: Phaser.GameObjects.Text;
  title?: Phaser.GameObjects.Text;
  loserText?: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, players: TypePlayer[], isGameOver: boolean) {
    this.scene = scene;

    this.wrapper = this.scene.add
      .sprite(config.width / 2, config.height / 2, 'winWrapper')
      .setDepth(200);
    this.wrapper.setInteractive({ cursor: 'pointer' }).on('pointerdown', () => this.destroy());
    //Добавить крестик для закрытия

    if (!isGameOver) {
      this.onWin(players[0]);
    } else {
      this.onEnd(players);
    }
  }
  onWin(me: TypePlayer) {
    //добавить картинку с короной на его аватарке
    this.congrats = this.scene.add
      .text(config.width / 2, config.height / 2, 'Congrats! You are the winner!', {
        color: '#fff',
        font: '30px Arial bold',
      })
      .setOrigin(0.5)
      .setDepth(201);
  }
  onEnd(players: TypePlayer[]) {
    this.title = this.scene.add
      .text(config.width / 2, config.height / 2 - 100, 'The game is over', {
        color: '#fff',
        font: '30px Arial bold',
      })
      .setOrigin(0.5)
      .setDepth(201);

    const loser = players.find((player) => player.playerStatus === TypePlayerStatus.YouLoser);

    if (loser) {
      //добавить картинку с колпаком на  аватарке лузера
      this.text = this.scene.add
        .text(config.width / 2, config.height / 2, 'The looser is', {
          color: '#fff',
          font: '25px Arial bold',
        })
        .setOrigin(0.5)
        .setDepth(201);
      this.loserText = this.scene.add
        .text(config.width / 2, config.height / 2 + 100, `${loser.playerName}`, {
          color: '#fff',
          font: '30px Arial bold',
        })
        .setOrigin(0.5)
        .setDepth(201);
    } else {
      this.text = this.scene.add
        .text(config.width / 2, config.height / 2, 'drawn game', {
          color: '#fff',
          font: '25px Arial bold',
        })
        .setOrigin(0.5)
        .setDepth(201);
    }
  }

  destroy() {
    this.wrapper.destroy();
    this.congrats?.destroy();
    this.title?.destroy();
    this.text?.destroy();
    this.loserText?.destroy();
  }
}
