import { config } from '../index';
import { useGameStore } from '../../../store/gameStore';
import { TypeButtonStatus } from '../scenes/GameScene';

export class Button extends Phaser.GameObjects.Sprite {
  scene: Phaser.Scene;
  status: TypeButtonStatus;
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'buttons', 'btn-start-disabled');
    this.scene = scene;
    this.status = TypeButtonStatus.Start;
    const a = config.width;
    const b = config.playersHands[1][0].width;
    this.x = (3 * a + b) / 4;
    this.y = config.height - config.cardSize.h / 2;
    this.scene.add.existing(this);
    this.setScale(0.8);

    this.setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.handleClick())
      .removeInteractive();
  }

  handleClick() {
    if (this.status === TypeButtonStatus.Start) {
      useGameStore.getState().actions.startGame();
      this.setFrame('btn-start-disabled');
    } else if (this.status === TypeButtonStatus.Take) {
      useGameStore.getState().actions.defenderTake();
      this.setFrame('btn-take-disabled');
    } else if (this.status === TypeButtonStatus.Pass) {
      useGameStore.getState().actions.attackerPass();
      this.setFrame('btn-pass-disabled');
    }
    this.removeInteractive();
  }

  update(status: TypeButtonStatus, active: boolean) {
    active ? this.makeInteractive(status) : this.makeInactive(status);
  }

  makeInactive(btnStatus: TypeButtonStatus) {
    this.removeInteractive();
    if (btnStatus === TypeButtonStatus.Start) this.setFrame('btn-start-disabled');
    else if (btnStatus === TypeButtonStatus.Take) this.setFrame('btn-take-disabled');
    else if (btnStatus === TypeButtonStatus.Pass) this.setFrame('btn-pass-disabled');
  }

  makeInteractive(btnStatus: TypeButtonStatus) {
    this.setInteractive({ cursor: 'pointer' });
    if (btnStatus === TypeButtonStatus.Start) this.setFrame('btn-start');
    else if (btnStatus === TypeButtonStatus.Take) this.setFrame('btn-take');
    else if (btnStatus === TypeButtonStatus.Pass) this.setFrame('btn-pass');
    this.status = btnStatus;
    this.on('pointerover', () => this.setScale(0.82));
    this.on('pointerout', () => this.setScale(0.8));
  }
}
