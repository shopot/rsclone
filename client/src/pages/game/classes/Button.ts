import { config } from '../index';

export class Button {
  width: number;
  height: number;
  rounded: number;
  coordX: number;
  coordY: number;
  bgColors: { active: number; inactive: number; focus: number };
  scene: Phaser.Scene;
  btnShape: Phaser.GameObjects.Graphics;
  btnText: Phaser.GameObjects.Text;
  text: string[];
  textColors: { active: number; inactive: number };
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.coordX = config.playersTables[1][0].startX + config.playersTables[1][0].width + 30;
    this.coordY = config.height - 100;
    this.width = 200;
    this.height = 60;
    this.rounded = 30;
    this.bgColors = { active: 0x68ff00, inactive: 0x666666, focus: 0xcdff00 };
    this.textColors = { active: 0xfff, inactive: 0x000000 };
    this.text = ['Start', 'Take', '?']; // какие названия по англ?

    this.btnShape = this.scene.add.graphics();
    this.drawButtonShape(this.bgColors.active);

    this.btnText = this.scene.add
      .text(this.coordX + 100, this.coordY + 30, this.text[0], {
        font: '30px',
        color: '#fff',
        strokeThickness: 1,
        stroke: '#fff',
      })
      .setPadding(50, 20, 50, 20)
      .setOrigin(0.5);
    this.btnText.setInteractive().on('pointerdown', () => {
      //начало игры + кнопка неактивная
      this.drawButtonShape(this.bgColors.inactive);
      this.changeText(this.textColors.inactive, this.text[0]);
      this.btnText.removeInteractive();
    });
    this.btnText.on('pointerover', () => this.drawButtonShape(this.bgColors.focus));
    this.btnText.on('pointerout', () => this.drawButtonShape(this.bgColors.active));
  }

  drawButtonShape(color: number) {
    this.btnShape
      .clear()
      .fillStyle(color, 0.3)
      .lineStyle(3, color, 1)
      .fillRoundedRect(this.coordX, this.coordY, this.width, this.height, this.rounded)
      .strokeRoundedRect(this.coordX, this.coordY, this.width, this.height, this.rounded);
  }

  changeText(color: number, text: string) {
    this.btnText.setText(text).setColor(color.toString()).setStroke(color.toString(), 1);
  }
}
