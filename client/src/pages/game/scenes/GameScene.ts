import Phaser from 'phaser';
// import { Card } from './Card';
import { config } from '../index';

export class GameScene extends Phaser.Scene {
  deckText!: Phaser.GameObjects.Text;
  deckCards = 36;
  players: number;
  myTable!: Phaser.GameObjects.Graphics;
  myTableSize: { width: number; height: number; startX: number };
  secondTableSize: { width: number; height: number; startX: number };
  constructor() {
    super('Game');
    this.players = 2;
    this.myTableSize = { width: config.width * 0.7, height: 235, startX: config.width * 0.15 };
    this.secondTableSize = { width: config.width * 0.4, height: 235, startX: config.width * 0.15 };
  }
  create() {
    this.createDeck();
    this.createTables();
    this.createCards(6, 1);
    this.createCards(5, 2);
  }

  createCards(num: number, player: number) {
    if (player === 1) {
      for (let i = 0; i < num; i++) {
        const randomIndex = Phaser.Math.Between(0, config.cardNames.length - 1);
        this.add.sprite(
          this.myTableSize.startX + 150 + i * 120, //get card size
          config.height - 235 / 2 + 2, //get card size
          'cards',
          config.cardNames[randomIndex],
        );
      }
    } else {
      for (let i = 0; i < num; i++) {
        this.add.sprite(
          this.myTableSize.startX + 150 + i * 120, //get card size
          config.height - 235 / 2 + 2, //get card size
          'cards',
          'cardBack',
        );
      }
    }
  }

  createTables() {
    this.myTable = this.add.graphics();
    this.myTable.lineStyle(2, +config.backgroundColor, 1);
    this.myTable.fillStyle(+config.backgroundColor, 0.3);
    this.myTable.fillRoundedRect(
      this.myTableSize.width,
      config.height - 235, //get card size
      config.width * 0.6,
      235, //get card size
      { tl: 20, tr: 20, bl: 0, br: 0 },
    );
    const otherTable = this.add.graphics();
    otherTable.lineStyle(2, +config.backgroundColor, 1);
    otherTable.fillStyle(+config.backgroundColor, 0.3);
    otherTable.fillRoundedRect(
      this.secondTableSize.width,
      0,
      config.width - this.myTableSize.width,
      170, //partially visible
      { tl: 0, tr: 0, bl: 20, br: 20 },
    );
  }
  createDeck() {
    const randomIndex = Phaser.Math.Between(0, config.cardNames.length - 1);
    this.add.sprite(150, config.height / 2, 'cards', config.cardNames[randomIndex]).setAngle(100);

    for (let i = 0; i < 5; i++) {
      this.add.sprite(100 - i / 2, config.height / 2 - i, 'cards', 'cardBack').setAngle(10);
    }

    this.deckText = this.add.text(45, config.height / 2 - 100, `${this.deckCards}`, {
      font: '30px',
      color: '#000000',
      strokeThickness: 3,
      stroke: '#000000',
    });
  }

  onDeckChange() {
    if (this.deckCards === 0) {
      //show suit
      this.deckText.setText('');
    } else {
      this.deckText.setText(`${this.deckCards}`);
    }
  }
}
