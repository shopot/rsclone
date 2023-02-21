import { config } from '../index';
import { useGameStore } from '../../../store/gameStore';
import { TypeButtonStatus } from '../scenes/GameScene';
export class Button {
  scene: Phaser.Scene;
  btnShape: Phaser.GameObjects.Graphics;
  btnText: Phaser.GameObjects.Text;
  bgColors: { active: number; inactive: number; focus: number };
  textColors: { active: number; inactive: number };
  params: { x: number; y: number; width: number; height: number; rounded: number };
  status: TypeButtonStatus;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.status = TypeButtonStatus.Start;
    this.params = {
      x: config.playersHands[1][0].startX + config.playersHands[1][0].width + 30,
      y: config.height - 100,
      width: 200,
      height: 60,
      rounded: 30,
    };
    this.bgColors = { active: 0x68ff00, inactive: 0x666666, focus: 0xcdff00 };
    this.textColors = { active: 0xfff, inactive: 0x000000 };

    this.btnShape = this.scene.add.graphics();
    this.drawButtonShape(this.bgColors.inactive);

    this.btnText = this.scene.add
      .text(this.params.x + 100, this.params.y + 30, TypeButtonStatus.Start, {
        font: '30px Signika',
        color: this.textColors.inactive.toString(),
        strokeThickness: 1,
        stroke: this.textColors.inactive.toString(),
      })
      .setPadding(50, 20, 50, 20)
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.handleClick())
      .removeInteractive();
  }

  handleClick() {
    if (this.status === TypeButtonStatus.Start) {
      useGameStore.getState().actions.startGame();
    } else if (this.status === TypeButtonStatus.Take) {
      useGameStore.getState().actions.defenderTake();
    } else if (this.status === TypeButtonStatus.Pass) {
      useGameStore.getState().actions.attackerPass();
    }
    this.drawButtonShape(this.bgColors.inactive);
    this.changeText(this.textColors.inactive, this.status);
    this.btnText.removeInteractive();
  }

  update(status: TypeButtonStatus, active: boolean) {
    active ? this.makeInteractive(status) : this.makeInactive(status);
  }

  makeInactive(btnStatus: TypeButtonStatus) {
    this.drawButtonShape(this.bgColors.inactive);
    this.changeText(this.textColors.inactive, btnStatus);
    this.btnText.removeInteractive();
  }

  makeInteractive(btnStatus: TypeButtonStatus) {
    this.drawButtonShape(this.bgColors.active);
    this.changeText(this.textColors.active, btnStatus);
    this.status = btnStatus;
    this.btnText.setInteractive();
    this.btnText.on('pointerover', () => this.drawButtonShape(this.bgColors.focus));
    this.btnText.on('pointerout', () => this.drawButtonShape(this.bgColors.active));
  }

  drawButtonShape(color: number) {
    this.btnShape
      .clear()
      .fillStyle(color, 0.3)
      .lineStyle(3, color, 1)
      .fillRoundedRect(
        this.params.x,
        this.params.y,
        this.params.width,
        this.params.height,
        this.params.rounded,
      )
      .strokeRoundedRect(
        this.params.x,
        this.params.y,
        this.params.width,
        this.params.height,
        this.params.rounded,
      );
  }

  changeText(color: number, text: string) {
    this.btnText.setText(text).setColor(color.toString()).setStroke(color.toString(), 1);
  }
}
