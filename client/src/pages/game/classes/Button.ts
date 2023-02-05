import { config } from '../index';

export class Button {
  width: number;
  height: number;
  rounded: number;
  coordX: number;
  coordY: number;
  bgColors: { active: number; inactive: number };
  scene: Phaser.Scene;
  btnShape: Phaser.GameObjects.Graphics;
  btnText: Phaser.GameObjects.Text;
  text: string[];
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.coordX = config.playersTables[1][0].startX + config.playersTables[1][0].width + 30;
    this.coordY = config.height - 100;
    this.width = 200;
    this.height = 50;
    this.rounded = 20;
    this.bgColors = { active: 0x00ff00, inactive: 0x666666 };
    this.text = ['Start', 'Take', '?']; // какие названия по англ?

    this.btnShape = this.scene.add
      .graphics()
      .fillRoundedRect(this.coordX, this.coordY, this.width, this.height, this.rounded)
      .strokeRoundedRect(this.coordX, this.coordY, this.width, this.height, this.rounded)
      .fillStyle(this.bgColors.active, 0.3)
      .lineStyle(3, this.bgColors.active, 1);
    // this.btnShape.setInteractive().on('pointerdown', () => {
    //   console.log('click');
    // });

    this.btnText = this.scene.add
      .text(this.coordX + 100, this.coordY + 25, this.text[0], {
        font: '30px',
        color: '#fff',
        strokeThickness: 1,
        stroke: '#fff',
      })
      .setPadding(30, 10, 30, 10)
      .setOrigin(0.5);
    this.btnText.setInteractive().on('pointerdown', () => {
      //начало игры + кнопка неактивная
      this.changeState(this.bgColors.inactive);
    });
    // .on('pointerdown', () => callback())
    // .on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
    // .on('pointerout', () => button.setStyle({ fill: '#FFF' }));
  }

  changeState(color: number) {
    this.btnShape.lineStyle(3, color, 1).fillStyle(color, 0.3);
  }
}
