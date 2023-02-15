import Phaser from 'phaser';
import { TypeCard, TypeRoomStatus } from '../../../shared/types';
import { config } from '../index';
import { socketIOService } from '../../../shared/api/socketio';
import { useGameStore } from '../../../store/gameStore';

export class Card extends Phaser.GameObjects.Sprite {
  value: string;
  cardType?: TypeCard;
  colors: { primaryColor: Phaser.Display.Color; secondaryColor: Phaser.Display.Color };
  highlighted: boolean;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture = 'cards',
    value: string,
    type?: TypeCard,
  ) {
    super(scene, x, y, texture, 'cardBack');
    this.scene = scene;
    this.value = value;
    this.cardType = type;
    this.highlighted = false;
    this.scene.add.existing(this);
    this.setScale(0.7);
    this.colors = {
      primaryColor: Phaser.Display.Color.ValueToColor(0xffffff),
      secondaryColor: Phaser.Display.Color.ValueToColor(0xeeee76),
    };
    this.setInteractive().on('pointerdown', () => this.onCardClick());
  }

  makeClickable() {
    this.open();
    this.setInteractive();
    // .on('pointerdown', () => this.makeMove());
  }
  makeNotClickable() {
    // this.on('pointerdown', () => null);
    this.removeInteractive();
  }

  onCardClick() {
    const socketId = socketIOService.getSocketId();
    const isSocketActive = socketId === useGameStore.getState().activeSocketId;
    const isGameOn = useGameStore.getState().roomStatus === TypeRoomStatus.GameInProgress;
    if (isSocketActive && this.cardType !== undefined && isGameOn) {
      const thisPlayer = useGameStore
        .getState()
        .players.filter((player) => player.socketId === socketId)[0];
      const isAttacker = thisPlayer.playerRole === 'Attacker';
      isAttacker
        ? useGameStore.getState().actions.makeAttackingMove(this.cardType)
        : useGameStore.getState().actions.makeDefensiveMove(this.cardType);
    }
  }

  open() {
    this.setFrame(this.value);
  }

  close() {
    this.setFrame('cardBack');
  }

  async positionTrump() {
    await new Promise((resolve) => {
      this.setAngle(100).setDepth(config.depth.trumpCard);
      this.makeNotClickable();
      this.open();
      this.depth = -1;
      this.scene.tweens.add({
        targets: this,
        x: 115,
        y: config.height / 2 + 5,
        ease: 'Linear',
        delay: 300,
        duration: 300,
        onComplete: resolve,
      });
    });
  }

  positionDeck(index: number) {
    this.setPosition(70 - index / 2, config.height / 2 - index);
    this.setDepth(50 + index);
    this.setAngle(10);
    this.makeNotClickable();
  }

  positionDeckCard(isForMainPlayer: boolean) {
    this.setPosition(70, config.height / 2).setAngle(10);
    if (!isForMainPlayer) {
      this.setFrame('cardBack');
      this.makeNotClickable();
    }
  }

  highlight() {
    this.highlighted = true;
    this.scene.tweens.addCounter({
      from: 1,
      to: 100,
      ease: 'Linear',
      duration: 500,
      onUpdate: (tween) => {
        const value = tween.getValue();
        const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(
          this.colors.primaryColor,
          this.colors.secondaryColor,
          100,
          value,
        );
        const color = Phaser.Display.Color.GetColor(colorObj.r, colorObj.g, colorObj.b);
        this.setTint(color);
      },
    });
  }

  removeHighlight() {
    this.setTint(0xffffff);
  }

  async animateToPlayer(playerInd: number, playersAmt: number) {
    await new Promise((resolve) => {
      const params =
        playersAmt <= 2
          ? config.playersHands[2]
          : playersAmt === 3
          ? config.playersHands[3]
          : config.playersHands[4];
      const coordY = playerInd === 0 ? config.height - config.cardSize.h / 2 : 30;
      this.scene.tweens.add({
        targets: this,
        x: params[playerInd].startX + params[playerInd].width / 2,
        y: coordY,
        scale: 0.7,
        ease: 'Linear',
        duration: 150,
        angle: 0,
        onComplete: resolve,
      });
      if (playerInd !== 0) this.close();
      else this.makeClickable();
    });
  }

  async animateToTable(pileIndex: number, isAttacking: boolean, piles: number, me: boolean) {
    await new Promise((resolve) => {
      this.makeNotClickable();
      if (!me) this.open();
      const positionArray = isAttacking ? config.placesForAttack : config.placesForDefend;
      const params =
        piles <= 3 ? positionArray[3] : piles <= 6 ? positionArray[6] : positionArray[12];
      const cardAngle = isAttacking ? -15 : -5;

      this.scene.tweens.add({
        targets: this,
        x: params[pileIndex].x,
        y: params[pileIndex].y,
        scale: params[pileIndex].scale,
        ease: 'Linear',
        duration: 300,
        angle: cardAngle,
        onComplete: resolve,
      });
      this.setDepth(isAttacking ? 2 : 100);
    });
  }

  async animateToBeaten(cardAngle: number, index: number) {
    this.setFrame('cardBack');
    await new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this,
        x: config.width,
        y: config.height / 2 - 20,
        scale: 0.7,
        ease: 'Linear',
        duration: 100,
        angle: cardAngle,
        onComplete: resolve,
      });
      this.setDepth(index + 2);
    });
  }

  //версия за пределы
  // async animateToBeaten() {
  //   this.setFrame('cardBack');
  //   await new Promise((resolve) => {
  //     this.scene.tweens.add({
  //       targets: this,
  //       x: config.width + config.cardSize.w,
  //       y: config.height / 2 - 20,
  //       ease: 'Linear',
  //       duration: 100,
  //       onComplete: resolve,
  //     });
  //   });
  // }

  async redrawTable(cardindex: number, pileIndex: number, piles: number) {
    const isAttacking = cardindex === 0 ? true : false;
    await this.animateToTable(pileIndex, isAttacking, piles, true);
  }

  // move(params: { isAttacker: boolean; place: number; me: boolean }) {
  //   //если вызван для карт других игроков, то переворачиваем перед ходом
  //   //если для главного игрока, то убираем возможность клика после попадения на стол
  //   if (!params.me) {
  //     this.open();
  //   } else {
  //     this.makeNotClickable();
  //   }
  //   if (!params.isAttacker) {
  //     this.setDepth(2);
  //   }
  //   this.animateToTable(params.place - 1, params.isAttacker, params.place);
  // }
}
