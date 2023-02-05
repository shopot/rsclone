import Phaser from 'phaser';
import { config } from '../index';
import { Table } from '../prefabs/Table';
import { IconPic } from '../prefabs/IconPic';
import { IconBorder } from '../prefabs/IconBorder';
import { Nickname } from '../prefabs/Nickname';
import { CardsText } from '../prefabs/CardsText';
import { Card } from '../prefabs/Card';
import { Suit } from '../prefabs/Suit';
import { Button } from '../classes/Button';

export class GameScene extends Phaser.Scene {
  deckText!: Phaser.GameObjects.Text;
  playersCards = [
    ['6C', '7H', '8S', '10H', 'AH', 'KD', 'QC', '7C', '6D', '6H', '6S'],
    ['6C', '7H', '8S', '10H', 'AH', 'KD'],
    ['6C', '7H', '8S'],
    ['6C', '7H', '8S', '10H'],
  ];
  beaten = 3;
  deckCards = 36 - this.playersCards.flat().length - this.beaten;
  players = 4;
  attack: boolean[];
  myTable!: Phaser.GameObjects.Graphics;
  piles: Card[][] = []; // стопочек на столе
  playersCardsSprites: Card[][] = [];
  tableSizes: { width: number; height: number; startX: number }[] = [];

  constructor() {
    super('Game');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.attack = new Array(this.players).fill(false);
  }

  create() {
    this.createBg();
    this.createTables();
    this.createButton();
    this.createDeck();
    this.createTrumpCard();
    this.createTrumpSuit();
    this.createCards();
    this.createCardsText();
    this.createIcons();
    this.createBeaten();
  }

  highlightCards(status: boolean) {
    //вызвать, когда мой статут фолс и кинута карта (pile имеет нечетные подмассивы)
    //подсветит, чем можно бить по возрастанию
    //когда мой статус тру и у меня есть карты того же значения, что и на столе
    //подсветит такие же карты, чтобы подкинуть
  }

  createBg() {
    const bg = this.add.sprite(config.width / 2, config.height / 2, 'bgDark');
    bg.depth = -5;
  }
  createBeaten() {
    //временно создаю спрайты, потом будут анимироваться со стола
    const centerX = config.width;
    const centerY = config.height / 2 - 20;
    const angle = 180 / (this.beaten + 1);
    for (let i = 0; i < this.beaten; i++) {
      this.add
        .sprite(centerX, centerY, 'cards', 'cardBack')
        .setScale(0.7)
        .setAngle(angle + i * angle);
    }
  }

  createButton() {
    const button = new Button(this);
  }

  createIcons() {
    for (let i = 0; i < this.players; i++) {
      const startX = this.tableSizes[i].startX;
      const spriteY = i === 0 ? config.height - config.cardSize.h + 25 : 82;
      //поменять на конркетную иконку
      new IconPic(this, startX - 40, spriteY, 'icons', config.icons[i]);

      //должен меняться цвет рамки на зеленый, когда ходит и на серый после
      new IconBorder(this, startX - 68, spriteY - 27, 55, 55, 5);

      const textY = i === 0 ? spriteY - 55 : spriteY + 40;
      //поменять на конркетный ник
      new Nickname(this, startX + 10, textY, `${config.icons[i]}`);
    }
  }

  setCardsPositions() {
    const border = 8;
    const tableSize = { ...this.tableSizes[0] };
    this.playersCardsSprites.forEach((set, i) => {
      tableSize.startX = this.tableSizes[i].startX;
      tableSize.width = this.tableSizes[i].width;
      const shift = (tableSize.width - border * 2 - config.cardSize.w) / (set.length - 1);
      const y = i === 0 ? config.height - config.cardSize.h / 2 : 30; //partially visible

      set.forEach((card, ind) => {
        let x = tableSize.startX + config.cardSize.w / 2 + ind * shift + border;
        if (set.length === 1) x = tableSize.startX + config.cardSize.w / 2 + border;
        card.setPosition(x, y);
      });
    });
  }

  createCards() {
    //на раздаче сделать анимацию движения карт в центр стола
    //затем сортировка по возрастанию и анимация распределения карт на столе (для главного - рубашой вниз)
    this.playersCards.forEach((set, ind) => {
      const arr: Card[] = [];
      set.forEach((el) => {
        const item = new Card(this, 0, 0, 'cards', el);
        arr.push(item);
      });
      this.playersCardsSprites.push(arr);
    });
    this.setCardsPositions();
    this.playersCardsSprites[0].forEach((card) => {
      card.setInteractive().open();
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.input.on('gameobjectdown', this.onCardClick, this);
  }

  onCardClick(pointer: PointerEvent, card: Card) {
    this.moveCardToTable(card);
  }

  moveCardToTable(card: Card) {
    //временно тру пока нет сервера
    this.attack[0] = true;
    //если разрешено(если у того, на которого ходят достаточно карт + если ход данного игрока разрешен правилами), то
    const indexOfPlayer = this.playersCardsSprites
      .map((set, ind) => {
        if (set.includes(card)) return ind;
      })
      .find((el) => el != undefined);

    //расположение карты в зависимости от того, кто нападает + сколько кучек уже на столе
    if (indexOfPlayer != undefined) {
      const params = { attack: this.attack[indexOfPlayer], place: -1 };

      const indexOfCard = this.playersCards[indexOfPlayer].indexOf(card.value);

      //если нападаю, то след кучку начинаю, иначе последнюю нечетную
      if (params.attack) {
        params.place = this.piles.length + 1;
        this.piles.push([card]);
      } else {
        const oddSet = this.piles.find((set) => set.length === 1) || [];
        params.place = this.piles.indexOf(oddSet);
        this.piles[this.piles.length].push(card);
      }
      card.move(params);

      //временно удаляю вручную, потом будет с сервера приходить массив обновленный
      this.playersCards[indexOfPlayer].splice(indexOfCard, 1);

      //перемещение спрайта от игрока
      this.playersCardsSprites[indexOfPlayer].splice(indexOfCard, 1);
      this.setCardsPositions();
    }
  }

  update() {
    if (this.piles.length === 4 || this.piles.length === 7) {
      this.piles.forEach((pile, piledInd) => {
        pile.forEach((card, cardInd) => card.redrawTable(cardInd, piledInd, this.piles.length));
      });
    }
  }

  createCardsText() {
    const textData = { x: 0, y: 70, amount: '' };
    const cardsWithoutMainPlayer = [...this.playersCards];
    cardsWithoutMainPlayer.splice(0, 1);
    cardsWithoutMainPlayer.forEach((set, i) => {
      textData.x = this.tableSizes[i + 1].startX + 20;
      if (set.length != 0) textData.amount = set.length.toString();
      new CardsText(this, textData);
    });
  }

  createTables() {
    this.tableSizes =
      this.players === 1
        ? config.playersTables[1]
        : this.players === 2
        ? config.playersTables[2]
        : this.players === 3
        ? config.playersTables[3]
        : config.playersTables[4];

    const params = {
      x: this.tableSizes[0].startX,
      y: config.height - this.tableSizes[0].height,
      width: this.tableSizes[0].width,
      height: this.tableSizes[0].height,
      rounded: { tl: 10, tr: 10, bl: 0, br: 0 },
    };
    for (let i = 0; i < this.players; i++) {
      if (i != 0) {
        params.x = this.tableSizes[i].startX;
        params.y = 0;
        params.width = this.tableSizes[i].width;
        params.height = 115; //partially visible
        params.rounded = { tl: 0, tr: 0, bl: 10, br: 10 };
      }
      new Table(this, params);
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

  // setAlive(value: boolean) {
  // в конце игры - скрыть текстуру, деактивировать объекты карт, если они будут улетать на пределы экрана. если в кучке битых, то не нужно.
  // }

  // onExit() {
  //   this.playersCardsSprites.flat().forEach((card) => card.destroy());
  // }
}
