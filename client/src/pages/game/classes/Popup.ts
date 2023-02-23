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
  openBtn?: Phaser.GameObjects.Sprite;
  startBtn?: Phaser.GameObjects.Sprite;
  openBtnText?: Phaser.GameObjects.Text;
  startBtnText?: Phaser.GameObjects.Text;
  sounds: { loser: Phaser.Sound.BaseSound };
  leaveBtnText?: Phaser.GameObjects.Text;
  leaveBtn?: Phaser.GameObjects.Sprite;
  whiteBorder?: Phaser.GameObjects.Graphics;
  depths: { onWin: number; onEnd: number; onHostLeave: number };

  constructor(
    scene: Phaser.Scene,
    players: TypePlayer[],
    isGameOver: boolean,
    isFirst: boolean,
    playerLeft?: TypePlayer,
  ) {
    this.scene = scene;
    this.colors = { winner: 0x00ff00, loser: 0x990000 };
    this.alphas = { onWin: 0.85, onEnd: 1 };
    this.depths = { onWin: 200, onEnd: 300, onHostLeave: 400 };
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
      } else if (players.length === 0) {
        this.createPopup(true, isFirst, undefined, true);
      } else {
        const loser = players.find((player) => player.playerStatus === TypePlayerStatus.YouLoser);
        this.createPopup(true, isFirst, loser);
      }
    }
  }

  createPopup(
    status: boolean,
    isFirst: boolean,
    player?: TypePlayer | undefined,
    didHostLeave?: boolean,
  ) {
    const titleText = status ? this.titleTexts.onEnd : this.titleTexts.onWin;
    const color = status ? this.colors.loser : this.colors.winner;
    const opacity = status ? this.alphas.onEnd : this.alphas.onWin;
    const zIndex = didHostLeave
      ? this.depths.onHostLeave
      : status
      ? this.depths.onEnd
      : this.depths.onWin;

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
      this.border = this.scene.add
        .graphics()
        .lineStyle(2, 0xfbc82f, 1)
        .strokeRoundedRect(config.width / 4, config.height / 4 - 30, 640, 360, 10)
        .setDepth(zIndex + 1);

      this.title = this.scene.add
        .text(config.width / 2, config.height / 2 - 150, titleText, {
          color: '#fff',
          font: '35px Signika',
        })
        .setOrigin(0.5)
        .setShadow(4, 2, '#000', 5)
        .setDepth(zIndex + 1);

      this.whiteBorder = this.scene.add
        .graphics()
        .lineStyle(2, 0xffffff, 0.8)
        .strokeRoundedRect(config.width / 2 - 259, config.height / 2 - 29 + shift, 518, 98, 10)
        .setDepth(zIndex + 1);

      this.rectangle = this.scene.add
        .graphics()
        .fillStyle(color, 0.6)
        .fillRoundedRect(config.width / 2 - 260, config.height / 2 - 30 + shift, 520, 100, 10)
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
          .setAlpha(0.8)
          .setStroke('#000', 2)
          .setDepth(zIndex + 1);

        this.playerName = this.scene.add
          .text(config.width / 3 + 70, config.height / 2 + 25 + shift, player.playerName, {
            color: '#fff',
            font: '25px Signika',
          })
          .setShadow(2, 1, '#000', 2)
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
        const text = didHostLeave ? 'The host has left, you are the host now' : 'Drawn game';
        this.playerText = this.scene.add
          .text(config.width / 2, config.height / 2 + 15 + shift, text, {
            color: '#fff',
            font: '30px Signika',
          })
          .setOrigin(0.5)
          .setDepth(zIndex + 1);
      }

      if (isFirst) {
        this.openBtnText = this.scene.add
          .text(config.width / 2 - 180, config.height / 2 + 30, 'Open the room', {
            color: '#fff',
            font: '18px Signika',
          })
          .setOrigin(0.5)
          .setDepth(zIndex + 1);
        this.openBtn = this.scene.add
          .sprite(config.width / 2 - 180, config.height / 2 + 80, 'buttons', 'btn-open')
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
          .text(config.width / 2, config.height / 2 + 30, 'Restart the game', {
            color: '#fff',
            font: '18px Signika',
          })
          .setOrigin(0.5)
          .setDepth(zIndex + 1);

        this.startBtn = this.scene.add
          .sprite(config.width / 2, config.height / 2 + 80, 'buttons', 'btn-start')
          .setScale(0.8)
          .setDepth(zIndex + 1)
          .setInteractive({ cursor: 'pointer' })
          .on('pointerdown', () => {
            this.destroyPopup();
            useGameStore.getState().actions.restartGame();
          })
          .on('pointerover', () => this.startBtn?.setScale(0.83))
          .on('pointerout', () => this.startBtn?.setScale(0.8));

        this.setStartBtnInactive(useGameStore.getState().players.length);

        this.leaveBtnText = this.scene.add
          .text(config.width / 2 + 180, config.height / 2 + 30, 'Leave the room', {
            color: '#fff',
            font: '18px Signika',
          })
          .setOrigin(0.5)
          .setDepth(zIndex + 1);

        this.leaveBtn = this.scene.add
          .sprite(config.width / 2 + 180, config.height / 2 + 80, 'buttons', 'btn-leave')
          .setScale(0.8)
          .setDepth(zIndex + 1)
          .setInteractive({ cursor: 'pointer' })
          .on('pointerdown', () => {
            this.destroyPopup();
            useGameStore.getState().actions.leaveRoom();
            this.scene.scene.start('End');
          })
          .on('pointerover', () => this.leaveBtn?.setScale(0.83))
          .on('pointerout', () => this.leaveBtn?.setScale(0.8));
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
    this.leaveBtn?.destroy();
    this.leaveBtnText?.destroy();
    this.whiteBorder?.destroy();
  }

  setStartBtnInactive(playersAmt: number) {
    if (playersAmt < 2) {
      this.startBtn?.setFrame('btn-start-disabled');
      this.startBtn?.removeInteractive();
    }
  }
}
