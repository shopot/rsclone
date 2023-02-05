import Phaser from 'phaser';
import { config } from '../index';

export class Card extends Phaser.GameObjects.Sprite {
  value: string;
  constructor(scene: Phaser.Scene, x: number, y: number, texture = 'cards', value: string) {
    super(scene, x, y, texture, 'cardBack');
    this.scene = scene;
    this.value = value;
    this.init();
  }
  init() {
    this.scene.add.existing(this);
    this.setScale(0.7);
  }

  open() {
    this.setFrame(this.value);
  }

  positionTrump() {
    this.setAngle(100);
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

  // setAlive(value: boolean) {
  //   this.setVisible(value);
  //   this.setActive(value); //фейзер перестанет отлеживать обновляемые события для этого объекта
  // }

  // update() {
  //   console.log(1111);
  // }

  moveAnimation(pileIndex: number, isAttacking: boolean, piles: number) {
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
  }

  redrawTable(cardindex: number, pileIndex: number, piles: number) {
    const isAttacking = cardindex === 0 ? true : false;
    this.moveAnimation(pileIndex, isAttacking, piles);
  }

  move(params: { attack: boolean; place: number }) {
    //если вызван для карт других игроков, то переворачиваем перед ходом
    //если для главного игрока, то убираем возможность клика после попадения на стол
    if (!this.active) {
      this.open();
    } else {
      this.removeInteractive();
    }
    this.moveAnimation(params.place - 1, params.attack, params.place);
  }
}
