import Phaser from 'phaser';
import { TypeCard, TypeRoomStatus } from '../../../shared/types';
import { config } from '../index';
import { socketIOService } from '../../../shared/api/socketio';
import { useGameStore, TypeGameState } from '../../../store/gameStore';

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
    this.init();
    this.colors = {
      primaryColor: Phaser.Display.Color.ValueToColor(0xffffff),
      secondaryColor: Phaser.Display.Color.ValueToColor(0xeeee76),
    };
    this.setInteractive().on('pointerdown', () => this.makeMove());
  }
  init() {
    this.scene.add.existing(this);
    this.setScale(0.7);
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

  makeMove() {
    console.log('try to move');
    const socketId = socketIOService.getSocketId();
    const isSocketActive = socketId === useGameStore.getState().activeSocketId;
    const isGameOn = useGameStore.getState().roomStatus === TypeRoomStatus.GameInProgress;
    console.log(socketId, 'socketId')
    console.log(isGameOn, 'isGameOn')
    console.log(this.cardType !== undefined, 'this.cardType !== undefined')
    if (isSocketActive && this.cardType !== undefined && isGameOn) {
      console.log('went to server');
      // this.cardToMove = card;
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

  positionTrump() {
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
      duration: 500,
    });
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

  // setAlive(value: boolean) {
  //   this.setVisible(value);
  //   this.setActive(value); //фейзер перестанет отлеживать обновляемые события для этого объекта
  // }

  // update() {
  //   console.log(1111);
  // }

  async moveToPlayer(playerInd: number, playersAmt: number) {
    await new Promise((resolve) => {
      const params =
        playersAmt <= 2
          ? config.playersTables[2]
          : playersAmt === 3
          ? config.playersTables[3]
          : config.playersTables[4];
      const coordY = playerInd === 0 ? config.height - config.cardSize.h / 2 : 30;
      this.scene.tweens.add({
        targets: this,
        x: params[playerInd].startX + params[playerInd].width / 2,
        y: coordY,
        scale: 0.7,
        ease: 'Linear',
        duration: 100,
        angle: 0,
        onComplete: resolve,
      });
      if (playerInd !== 0) this.close();
      else this.makeClickable();
    });
  }

  moveFromPlayerToTable(pileIndex: number, isAttacking: boolean, piles: number) {
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
    });
    this.setDepth(isAttacking ? 2 : 100);
  }

  redrawTable(cardindex: number, pileIndex: number, piles: number) {
    const isAttacking = cardindex === 0 ? true : false;
    this.moveFromPlayerToTable(pileIndex, isAttacking, piles);
  }

  move(params: { isAttacker: boolean; place: number; me: boolean }) {
    //если вызван для карт других игроков, то переворачиваем перед ходом
    //если для главного игрока, то убираем возможность клика после попадения на стол
    if (!params.me) {
      this.open();
    } else {
      this.makeNotClickable();
    }
    if (!params.isAttacker) {
      this.setDepth(2);
    }
    this.moveFromPlayerToTable(params.place - 1, params.isAttacker, params.place);
  }
}
