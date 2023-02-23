import { TypePlayer, TypePlayerStatus } from '../../../shared/types';
import { useGameStore } from '../../../store/gameStore';
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
  depths: { onWin: number; onEnd: number };
  openBtn?: Phaser.GameObjects.Sprite;
  startBtn?: Phaser.GameObjects.Sprite;
  openBtnText?: Phaser.GameObjects.Text;
  startBtnText?: Phaser.GameObjects.Text;
  sounds: { loser: Phaser.Sound.BaseSound };

  constructor(
    scene: Phaser.Scene,
    players: TypePlayer[],
    isGameOver: boolean,
    isFirst: boolean,
    playerLeft?: TypePlayer,
  ) {
    this.scene = scene;
    this.colors = { winner: 0x00ff00, loser: 0xee0808 };
    this.alphas = { onWin: 0.85, onEnd: 1 };
    this.depths = { onWin: 200, onEnd: 300 };
    this.titleTexts = { onWin: 'Congrats! You are not a fool!', onEnd: 'The game is over' };
    this.sounds = {
      loser: this.scene.sound.add('loser'),
    };

    useGameStore.subscribe(
      (state) => state.players.length,
      (data) => this.setStartBtnInactive(data),
    );

    if (!isGameOver) {
      const me = players[0];
      this.createPopup(false, isFirst, me);
    } else {
      if (playerLeft) {
        this.createPopup(true, isFirst, playerLeft);
      } else {
        const loser = players.find((player) => player.playerStatus === TypePlayerStatus.YouLoser);
        this.createPopup(true, isFirst, loser);
      }
    }
  }

  createPopup(status: boolean, isFirst: boolean, player?: TypePlayer | undefined) {
    const titleText = status ? this.titleTexts.onEnd : this.titleTexts.onWin;
    const color = status ? this.colors.loser : this.colors.winner;
    const opacity = status ? this.alphas.onEnd : this.alphas.onWin;
    const zIndex = status ? this.depths.onEnd : this.depths.onWin;
    const shift = isFirst ? -80 : -20;

    this.wrapper = this.scene.add
      .sprite(config.width / 2, config.height / 2 - 30, 'winWrapper')
      .setAlpha(0)
      .setDepth(zIndex);
    if (!isFirst) {
      this.wrapper
        .setInteractive({ cursor: 'pointer' })
        .on('pointerdown', () => this.destroyPopup());
    }

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
        .text(config.width / 2, config.height / 2 - 150, titleText, {
          color: '#fff',
          font: '35px Signika',
        })
        .setOrigin(0.5)
        .setDepth(zIndex + 1);

      this.rectangle = this.scene.add
        .graphics()
        .fillStyle(color, 0.6)
        .lineStyle(2, color, 1)
        .fillRoundedRect(config.width / 2 - 250, config.height / 2 - 30 + shift, 500, 100, 10)
        .strokeRoundedRect(config.width / 2 - 250, config.height / 2 - 30 + shift, 500, 100, 10)
        .setDepth(zIndex + 1);

      if (player !== undefined) {
        const text = status ? 'The fool is:' : 'The winner is:';

        if (status) {
          this.sounds.loser.play({ volume: 0.5, loop: false });
        }
        this.playerText = this.scene.add
          .text(config.width / 3 + 70, config.height / 2 - 15 + shift, text, {
            color: '#fff',
            font: '25px Signika',
          })
          .setDepth(zIndex + 1);

        this.playerName = this.scene.add
          .text(config.width / 3 + 70, config.height / 2 + 25 + shift, player.playerName, {
            color: '#fff',
            font: '25px Signika',
          })
          .setDepth(zIndex + 1);

        this.avatar = this.scene.add
          .sprite(
            config.width / 3 - 20,
            config.height / 2 - 10 + shift,
            'icons',
            player.playerAvatar,
          )
          .setOrigin(0, 0)
          .setDepth(zIndex + 1);

        const hat = status ? 'foolscap' : 'crown';
        this.aword = this.scene.add
          .sprite(config.width / 3 + 30, config.height / 2 - 22 + shift, 'aword', hat)
          .setScale(0.8)
          .setAngle(20)
          .setDepth(zIndex + 1);
      } else {
        this.playerText = this.scene.add
          .text(config.width / 2, config.height / 2 + 15 + shift, 'Drawn game', {
            color: '#fff',
            font: '30px Signika',
          })
          .setOrigin(0.5)
          .setDepth(zIndex + 1);
      }

      if (isFirst) {
        this.openBtnText = this.scene.add
          .text(config.width / 2 - 140, config.height / 2 + 30, 'Open the room', {
            color: '#fff',
            font: '18px Signika',
          })
          .setOrigin(0.5)
          .setDepth(zIndex + 1);
        this.openBtn = this.scene.add
          .sprite(config.width / 2 - 140, config.height / 2 + 80, 'buttons', 'btn-open')
          .setScale(0.8)
          .setDepth(zIndex + 1)
          .setInteractive({ cursor: 'pointer' })
          .on('pointerdown', () => {
            this.destroyPopup();
            useGameStore.getState().actions.openRoom();
          })
          .on('pointerover', () => this.openBtn?.setScale(0.83))
          .on('pointerout', () => this.openBtn?.setScale(0.8));

        this.startBtnText = this.scene.add
          .text(config.width / 2 + 140, config.height / 2 + 30, 'Restart the game', {
            color: '#fff',
            font: '18px Signika',
          })
          .setOrigin(0.5)
          .setDepth(zIndex + 1);

        this.startBtn = this.scene.add
          .sprite(config.width / 2 + 140, config.height / 2 + 80, 'buttons', 'btn-start')
          .setScale(0.8)
          .setDepth(zIndex + 1)
          .setInteractive({ cursor: 'pointer' })
          .on('pointerdown', () => {
            this.destroyPopup();
            useGameStore.getState().actions.restartGame();
          })
          .on('pointerover', () => this.startBtn?.setScale(0.83))
          .on('pointerout', () => this.startBtn?.setScale(0.8));
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
    this.openBtn?.destroy();
    this.startBtn?.destroy();
    this.openBtnText?.destroy();
    this.startBtnText?.destroy();
  }

  setStartBtnInactive(playersAmt: number) {
    if (playersAmt < 2) {
      this.startBtn?.setFrame('btn-start-disabled').removeInteractive();
    }
  }
}
