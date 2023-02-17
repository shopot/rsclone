import { config } from '../index';
import { useGameStore } from '../../../store/gameStore';
import { TypeButtonStatus } from '../scenes/GameScene';

export class Button extends Phaser.GameObjects.Sprite {
  scene: Phaser.Scene;
  status: TypeButtonStatus;
  colors: { primaryColor: Phaser.Display.Color; secondaryColor: Phaser.Display.Color };
  counter: number;
  scales: { first: number; second: number };
  targetScale: number;
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

    this.colors = {
      primaryColor: Phaser.Display.Color.ValueToColor(0xffffff),
      secondaryColor: Phaser.Display.Color.ValueToColor(0xe8c715),
    };

    this.setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.handleClick())
      .removeInteractive();

    this.counter = 1;
    this.scales = { first: 1, second: 0.8 };
    this.targetScale = 1;
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

  animateBeforeStart() {
    this.setFrame('btn-start');
    this.scaleAnimation();
  }

  scaleAnimation() {
    this.scene.tweens.add({
      targets: this,
      scale: this.targetScale,
      ease: 'Sine.easeInOut',
      duration: this.counter * 100,
      onComplete: () => {
        this.counter++;
        if (this.counter < 7) {
          this.targetScale = this.counter % 2 == 0 ? this.scales.second : this.scales.first;
          this.scaleAnimation();
        } else {
          this.update(TypeButtonStatus.Start, true);
        }
      },
    });
  }
}
