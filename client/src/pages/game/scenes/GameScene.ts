import Phaser from 'phaser';
import { config } from '../index';
import { Table } from '../classes/Table';
import { Icon } from '../classes/Icon';
import { IconBorder } from '../classes/IconBorder';
import { Nickname } from '../classes/Nickname';
import { CardsText } from '../classes/CardsText';
import { Card } from '../classes/Card';
import { Suit } from '../classes/Suit';
import { MainCard } from '../classes/MainCard';

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
  playersCards = [
    ['6C', '7H', '8S', '10H', 'AH', 'KD', 'QC', '7C'],
    ['6C', '7H', '8S', '10H', 'AH', 'KD'],
    ['6C', '7H', '8S', '10H', 'AH', 'KD', 'QC'],
    ['6C', '7H', '8S', '10H'],
  ];
  beaten = 7;
  mainTableCards: (MainCard | Card)[] = [];
  deckCards = 36 - this.playersCards.flat().length - this.beaten;
  players = 4;
  myTable!: Phaser.GameObjects.Graphics;
  myTableSize: TableSize;
  secondTableSize: TableSize;
  thirdTableSize!: TableSize;
  forthTableSize!: TableSize;
  buttonStates = ['Start', 'Take', '?']; // какие названия по англ?
  attack = true;
  piles = 0; // стопочек на столе
  playersCardsSprites: (MainCard[] | Card[])[] = [];

  constructor() {
    super('Game');

    this.myTableSize = {
      width: config.width * 0.6,
      height: config.cardSize.h + 8,
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
      height: config.cardSize.h + 8,
      startX: config.width * secondTableScales.scalePosotion,
    };
    this.thirdTableSize = {
      width: config.width * thirdTableScales.scaleWidth,
      height: config.cardSize.h + 8,
      startX: config.width * thirdTableScales.scalePosotion,
    };
    this.forthTableSize = {
      width: config.width * forthTableScales.scaleWidth,
      height: config.cardSize.h + 8,
      startX: config.width * forthTableScales.scalePosotion,
    };
  }

  create() {
    this.createBg();
    this.createButton();
    this.createDeck();
    this.createTrumpCard();
    this.createTrumpSuit();
    this.createTables();
    this.createCards();
    this.createCardsText();
    this.createIcons();
    this.createBeaten();
  }

  createBg() {
    const bg = this.add.sprite(config.width / 2, config.height / 2, 'bgDark');
    bg.depth = -5;
  }
  createBeaten() {
    this.beaten = 5;
    const centerX = config.width;
    const centerY = (config.height - config.cardSize.h) / 2;
    const angle = 180 / (this.beaten + 1);
    const dY = Math.cos(angle) / 100;
    const dX = Math.sin(angle) / 100;
    for (let i = 0; i < this.beaten; i++) {
      this.add
        .sprite(centerX - dX * i, centerY - dY * i, 'cards', 'cardBack')
        .setScale(0.7)
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
      const spriteY = i === 1 ? config.height - config.cardSize.h + 25 : 82;
      //поменять на конркетную иконку
      new Icon(this, tableSize.startX - 40, spriteY, 'icons', config.icons[i]);

      //должен меняться цвет рамки на зеленый, когда ходит и на серый после
      new IconBorder(this, tableSize.startX - 68, spriteY - 27, 55, 55, 5);

      const textY = i === 1 ? spriteY - 55 : spriteY + 40;
      //поменять на конркетный ник
      new Nickname(this, tableSize.startX + 10, textY, `${config.icons[i]}`);
    }
  }

  setCardsPositions() {
    const border = 8;
    const tableSize = { ...this.myTableSize };
    this.playersCardsSprites.forEach((set, i) => {
      if (i === 1) {
        tableSize.width = this.secondTableSize.width;
        tableSize.startX = this.secondTableSize.startX;
      } else if (i === 2) {
        tableSize.width = this.thirdTableSize.width;
        tableSize.startX = this.thirdTableSize.startX;
      } else if (i === 3) {
        tableSize.width = this.forthTableSize.width;
        tableSize.startX = this.forthTableSize.startX;
      }

      const shift = (tableSize.width - border * 2 - config.cardSize.w) / (set.length - 1);
      const y = i === 0 ? config.height - config.cardSize.h / 2 : 30; //partially visible

      set.forEach((card, ind) => {
        const x = tableSize.startX + config.cardSize.w / 2 + ind * shift + border;
        card.setPosition(x, y);
      });
    });
  }

  createCards() {
    //на раздаче сделать анимацию движения карт в центр стола
    //затем сортировка по возрастанию и анимация распределения карт на столе (для главного - рубашой вниз)
    this.playersCards.forEach((set, ind) => {
      if (ind === 0) {
        const arr: MainCard[] = [];
        set.forEach((el) => {
          const item = new MainCard(this, 0, 0, 'cards', el);
          arr.push(item);
        });
        this.playersCardsSprites.push(arr);
      } else {
        const arr: Card[] = [];
        set.forEach((el) => {
          const item = new Card(this, 0, 0, 'cards', el);
          arr.push(item);
        });
        this.playersCardsSprites.push(arr);
      }
    });
    this.setCardsPositions();
    this.input.on('gameobjectdown', this.onCardClick, this);
  }
  onCardClick(pointer: PointerEvent, card: MainCard) {
    this.piles++;
    //если разрешено, то мув
    //логика расположения карты в зависимости от того, кто нападает + где лежат последние карты
    card.move(this.attack, this.piles);
    // console.log(this.cardsPlayer1)
    const ind = this.playersCards[0].indexOf(card.value);
    this.playersCards[0].splice(ind, 1);
    this.mainTableCards.push(this.playersCardsSprites[0][ind]);
    this.playersCardsSprites[0].splice(ind, 1);
    this.setCardsPositions();
    // this.attack = !this.attack;
  }

  createCardsText() {
    const textData = { x: 0, y: 70, amount: '' };
    const cards = [...this.playersCards];
    cards.splice(0, 1);
    cards.forEach((set, i) => {
      if (i === 0) {
        textData.x = this.secondTableSize.startX + 20;
      } else if (i === 1) {
        textData.x = this.thirdTableSize.startX + 20;
      } else if (i === 2) {
        textData.x = this.forthTableSize.startX + 20;
      }
      if (set.length != 0) textData.amount = set.length.toString();
      new CardsText(this, textData);
    });
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
    for (let i = 0; i < this.deckCards - 1; i++) {
      new Card(this, 70 - i / 2, config.height / 2 - i, 'cards', 'cardBack').setAngle(10);
    }
    const textData = { x: 30, y: config.height / 2 - 80, amount: `${this.deckCards}` };
    new CardsText(this, textData);
  }

  createTrumpCard() {
    //temporary using random //появится после старта
    const randomIndex = Phaser.Math.Between(0, config.cardNames.length - 1);
    new Card(this, 80, config.height / 2, 'cards', config.cardNames[randomIndex]).positionTrump();
  }
  createTrumpSuit() {
    //temporary using random //появится после старта
    new Suit(this, config.suits[1]);
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
