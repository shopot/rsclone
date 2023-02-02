import Phaser from 'phaser';
import { config } from '../index';
import { Table } from '../classes/Table';
import { Deck } from '../classes/Deck';

// export class Button extends Phaser.Scene {
//   create() {
//     const button = this.add.text(400, 400, 'start', { color: '#0f0' });
//     button.setInteractive();
//   }
// }
type TableSize = {
  width: number;
  height: number;
  startX: number;
};
export class GameScene extends Phaser.Scene {
  deckText!: Phaser.GameObjects.Text;
  cardAmt_1 = 9;
  cardAmt_2 = 5;
  cardAmt_3 = 3;
  cardAmt_4 = 4;
  beaten = 7;
  deckCards = 36 - this.cardAmt_1 - this.cardAmt_2 - this.cardAmt_3 - this.cardAmt_4 - this.beaten;
  players = 4;
  myTable!: Phaser.GameObjects.Graphics;
  cardWidth = 150 * config.scaleCards;
  cardHeight = 225 * config.scaleCards;
  myTableSize: TableSize;
  secondTableSize: TableSize;
  thirdTableSize!: TableSize;
  forthTableSize!: TableSize;
  cardsAmtText_2!: Phaser.GameObjects.Text;
  buttonStates = ['Start', 'Take', '?']; // какие названия по англ?

  constructor() {
    super('Game');

    this.myTableSize = {
      width: config.width * 0.6,
      height: 235 * config.scaleCards,
      startX: config.width * 0.2,
    };

    const secondTableScales = { scaleWidth: 1, scalePosotion: 1 };
    const thirdTableScales = { scaleWidth: 1, scalePosotion: 1 };
    const forthTableScales = { scaleWidth: 1, scalePosotion: 1 };
    if (this.players === 2) {
      secondTableScales.scaleWidth = 0.3;
      secondTableScales.scalePosotion = 0.35;
    } else if (this.players === 3) {
      secondTableScales.scaleWidth = 0.3;
      secondTableScales.scalePosotion = 0.15;
      thirdTableScales.scaleWidth = 0.3;
      thirdTableScales.scalePosotion = 0.65;
    } else if (this.players === 4) {
      secondTableScales.scaleWidth = 0.2;
      secondTableScales.scalePosotion = 0.15;
      thirdTableScales.scaleWidth = 0.2;
      thirdTableScales.scalePosotion = 0.45;
      forthTableScales.scaleWidth = 0.2;
      forthTableScales.scalePosotion = 0.75;
    }
    this.secondTableSize = {
      width: config.width * secondTableScales.scaleWidth,
      height: 235 * config.scaleCards,
      startX: config.width * secondTableScales.scalePosotion,
    };
    this.thirdTableSize = {
      width: config.width * thirdTableScales.scaleWidth,
      height: 235 * config.scaleCards,
      startX: config.width * thirdTableScales.scalePosotion,
    };
    this.forthTableSize = {
      width: config.width * forthTableScales.scaleWidth,
      height: 235 * config.scaleCards,
      startX: config.width * forthTableScales.scalePosotion,
    };
  }

  create() {
    this.createButton();
    this.createDeck();
    this.createTables();
    this.createCards();
    this.createCardsText();
    this.createIcons();
    this.createBeaten();
  }

  createBeaten() {
    this.beaten = 5;
    const centerX = config.width;
    const centerY = (config.height - this.cardHeight) / 2;
    const angle = 180 / (this.beaten + 1);
    const dY = Math.cos(angle) / 100;
    const dX = Math.sin(angle) / 100;
    for (let i = 0; i < this.beaten; i++) {
      this.add
        .sprite(centerX - dX * i, centerY - dY * i, 'cards', 'cardBack')
        .setScale(config.scaleCards)
        .setAngle(angle + i * angle);
    }
  }

  createButton() {
    const buttonText = this.add
      .text(
        this.myTableSize.startX + this.myTableSize.width + 50,
        config.height - 100,
        `${this.buttonStates[0]}`,
        {
          font: '30px',
          color: '#000000',
          strokeThickness: 1,
          stroke: '#000000',
          backgroundColor: '#00ff00',
        },
      )
      .setPadding(30, 10, 30, 10)
      // .setStroke('##0eff00', 2)
      .setInteractive()
      .on('pointerdown', () => {
        console.log('click');
      });
    // .on('pointerdown', () => callback())
    // .on('pointerover', () => button.setStyle({ fill: '#f39c12' }))
    // .on('pointerout', () => button.setStyle({ fill: '#FFF' }));
  }

  createIcons() {
    const tableSize = { ...this.myTableSize };
    for (let i = 1; i <= this.players; i++) {
      if (i === 2) {
        tableSize.startX = this.secondTableSize.startX;
      } else if (i === 3) {
        tableSize.startX = this.thirdTableSize.startX;
      } else if (i === 4) {
        tableSize.startX = this.forthTableSize.startX;
      }
      const spriteY = i === 1 ? config.height - this.cardHeight + 25 : 82;
      const icon = this.add
        .sprite(tableSize.startX - 40, spriteY, 'icons', config.icons[i])
        .setScale(0.3);

      //должен меняться цвет рамки на зеленый, когда ходит
      const border = this.add
        .graphics()
        .lineStyle(4, 0x606060, 1)
        .strokeRoundedRect(tableSize.startX - 68, spriteY - 27, 55, 55, 5);

      const textY = i === 1 ? spriteY - 55 : spriteY + 40;
      const nickname = this.add.text(tableSize.startX + 10, textY, `${config.icons[i]}`, {
        font: '16px',
        color: '#000000',
        strokeThickness: 1,
        stroke: '#000000',
      });
    }
  }

  createCards() {
    const border = 10;
    const tableSize = { ...this.myTableSize };
    const cards = { amount: this.cardAmt_1 };
    for (let i = 1; i <= this.players; i++) {
      if (i === 2) {
        tableSize.width = this.secondTableSize.width;
        tableSize.startX = this.secondTableSize.startX;
        cards.amount = this.cardAmt_2;
      } else if (i === 3) {
        tableSize.width = this.thirdTableSize.width;
        tableSize.startX = this.thirdTableSize.startX;
        cards.amount = this.cardAmt_3;
      } else if (i === 4) {
        tableSize.width = this.forthTableSize.width;
        tableSize.startX = this.forthTableSize.startX;
        cards.amount = this.cardAmt_4;
      }

      const shift = (tableSize.width - border * 2 - this.cardWidth) / (cards.amount - 1); // get card size 150
      const y = i === 1 ? config.height - this.cardHeight / 2 : 30; //partially visible

      for (let j = 0; j < cards.amount; j++) {
        //TODO change randwom cards for 1st player for real
        const texture =
          i === 1
            ? config.cardNames[Phaser.Math.Between(0, config.cardNames.length - 1)]
            : 'cardBack';
        this.add
          .sprite(tableSize.startX + this.cardWidth / 2 + j * shift + border, y, 'cards', texture)
          .setScale(config.scaleCards);
      }
      if (cards.amount === 1) {
        this.add
          .sprite(
            tableSize.startX + this.cardWidth / 2 + border,
            y,
            'cards',
            //TODO change randwom cards for 1st player for real
            config.cardNames[11],
          )
          .setScale(config.scaleCards);
      }
    }
  }

  createCardsText() {
    const textData = { coordX: 0, amount: 0 };
    for (let i = 2; i <= this.players; i++) {
      if (i === 2) {
        textData.coordX = this.secondTableSize.startX;
        textData.amount = this.cardAmt_2;
      } else if (i === 3) {
        textData.coordX = this.thirdTableSize.startX;
        textData.amount = this.cardAmt_3;
      } else if (i === 4) {
        textData.coordX = this.forthTableSize.startX;
        textData.amount = this.cardAmt_4;
      }
      this.cardsAmtText_2 = this.add.text(textData.coordX + 20, 70, `${textData.amount}`, {
        font: '26px',
        color: '#FFFF00',
        strokeThickness: 4,
        stroke: '#000000',
      });
    }
  }

  createTables() {
    const params = {
      x: this.myTableSize.startX,
      y: config.height - this.myTableSize.height,
      width: this.myTableSize.width,
      height: this.myTableSize.height,
      rounded: { tl: 10, tr: 10, bl: 0, br: 0 },
    };
    for (let i = 1; i <= this.players; i++) {
      if (i != 1) {
        params.y = 0;
        params.height = 115; //partially visible
        params.rounded = { tl: 0, tr: 0, bl: 10, br: 10 };
      }
      if (i === 2) {
        params.x = this.secondTableSize.startX;
        params.width = this.secondTableSize.width;
      } else if (i === 3) {
        params.x = this.thirdTableSize.startX;
        params.width = this.thirdTableSize.width;
      } else if (i === 4) {
        params.x = this.forthTableSize.startX;
        params.width = this.forthTableSize.width;
      }
      new Table(this, params.x, params.y, params.width, params.height, params.rounded);
    }
  }

  createDeck() {
    //temporary using random
    const randomIndex = Phaser.Math.Between(0, config.cardNames.length - 1);
    this.add
      .sprite(110, config.height / 2, 'cards', config.cardNames[randomIndex])
      .setAngle(100)
      .setScale(config.scaleCards);

    // const deck = new Deck(this);
    for (let i = 0; i < 5; i++) {
      this.add
        .sprite(70 - i / 2, config.height / 2 - i, 'cards', 'cardBack')
        .setAngle(10)
        .setScale(config.scaleCards);
    }

    this.deckText = this.add.text(30, config.height / 2 - 80, `${this.deckCards}`, {
      font: '26px',
      color: '#FFFF00',
      strokeThickness: 4,
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
