import Phaser from 'phaser';
import { config } from '../index';
import { Table } from '../prefabs/Table';
import { CardsText } from '../prefabs/CardsText';
import { Card } from '../prefabs/Card';
import { Suit } from '../prefabs/Suit';
import { Button } from '../classes/Button';
import { socketIOService } from '../../../shared/api/socketio';
import { useGameStore, TypeGameState } from '../../../store/gameStore';
import {
  TypeCard,
  TypeDealt,
  TypePlacedCard,
  TypePlayer,
  TypePlayerRole,
  TypeRoomStatus,
} from '../../../shared/types';
import { Icon } from '../classes/Icon';

export const enum TypeButtonStatus {
  Start = 'Start',
  Pass = 'Pass',
  Take = 'Take',
}

export class GameScene extends Phaser.Scene {
  beaten = 3;
  // deckCards = 36 - this.playersCards.flat().length - this.beaten;
  attack: boolean[] = [];
  piles: Card[][] = []; // стопочек на столе
  playersCardsSprites: Card[][] = [];
  tableSizes: { width: number; height: number; startX: number }[] = [];
  playersSorted: TypePlayer[] = [];
  playersSortedPrev: TypePlayer[] = [];
  tables: Table[] = [];
  icons: Icon[] = [];
  deckCards: Card[] = [];
  deckText: CardsText | undefined;
  trump: TypeCard = useGameStore.getState().trumpCard;
  mainButton: Button | undefined;
  socketId = socketIOService.getSocketId();
  playersCards: TypeCard[][] = [];
  playersText: CardsText[] = [];
  cardToMove: Card | undefined;

  constructor() {
    super('Game');

    const setPlayers = useGameStore.subscribe(
      (state) => state.players.length,
      (data) => this.setPlayers(),
    );

    const sortPlayers = useGameStore.subscribe(
      (state) => state.players,
      (data) => this.sortPlayers(data),
    );

    const updateDeck = useGameStore.subscribe(
      (state) => state.deckCounter,
      (data) => this.updateDeck(data),
    );
    const updatePlayersText = useGameStore.subscribe(
      (state) => state.players,
      (data) => this.updatePlayersText(data),
    );

    const updateButton = useGameStore.subscribe(
      (state) => [state.roomStatus, state.activeSocketId],
      (arr) => this.updateButton(arr),
    );

    const gameStarted = useGameStore.subscribe(
      (state) => state.roomStatus,
      (data) => this.startGame(data),
    );

    const colorIcon = useGameStore.subscribe(
      (state) => state.activeSocketId,
      (data) => this.colorIcon(data),
    );

    const animateCardMoveToTable = useGameStore.subscribe(
      (state) => state,
      (state, prevState) => this.animateCardMoveToTable(state, prevState),
    );

    const updateTablePosition = useGameStore.subscribe(
      (state) => state.placedCards,
      (data) => this.updateTable(data),
    );

    const handleDealt = useGameStore.subscribe(
      (state) => state.dealt,
      (data) => this.handleDealt(data),
    );

    // const tmp = useGameStore.subscribe((state) => console.log(state));
  }

  create() {
    //добавить в стейт выбор темы и тогда грузить светлый или темный бг
    this.createBg();
    this.createButtons();

    this.setPlayers();

    this.createDeck(useGameStore.getState().deckCounter);

    // this.createBeaten();
  }

  handleDealt(dealt: TypeDealt[]) {
    if (useGameStore.getState().currentRound > 1) {
      const sortedDealt = [...dealt];
      const me = dealt.filter((player) => player.socketId === this.socketId)[0];

      while (sortedDealt.indexOf(me) !== 0) {
        const first = sortedDealt.shift();
        if (first !== undefined) sortedDealt.push(first);
      }
      //Todo: отрисовать добавление спрайтов некоторым из колоды, некоторым со стола
    }
  }

  startGame(status: TypeRoomStatus) {
    this.trump = useGameStore.getState().trumpCard;
    if (status === 'GameInProgress') {
      this.createTrumpSuit();
      this.createTrumpCard();
      //анимацию сделать раздачи + расположения на столах игроков
      this.createCards();
      this.createCardsText();
    }
  }

  highlightCards() {
    //вызвать, когда мой статут фо1лс и кинута карта (pile имеет нечетные подмассивы)
    //подсветит, чем можно бить по возрастанию
    //когда мой статус тру и у меня есть карты того же значения, что и на столе
    //подсветит такие же карты, чтобы подкинуть
    [...this.playersCardsSprites].flat().forEach((card) => card.removeHighlight());
    const targets = [this.playersCardsSprites[0][5], this.playersCardsSprites[0][10]];
    targets.forEach((card) => card.highlight());
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
        const item = new Card(this, 0, 0, 'cards', this.getCardTexture(el), el);
        arr.push(item);
      });
      this.playersCardsSprites.push(arr);
    });
    this.setCardsPositions();
    this.playersCardsSprites[0].forEach((card) => {
      card.setInteractive().open();
    });
    this.input.on('gameobjectdown', this.makeMove.bind(this));

    //временно подсвечиваю
    // this.highlightCards();
  }

  makeMove(pointer: PointerEvent, card: Card) {
    console.log('try to move');
    const isSocketActive = this.socketId === useGameStore.getState().activeSocketId;
    const isGameOn = useGameStore.getState().roomStatus === TypeRoomStatus.GameInProgress;
    if (isSocketActive && card.cardType !== undefined && isGameOn) {
      console.log('went to server');
      this.cardToMove = card;
      const isAttacker = this.playersSorted[0].playerRole === 'Attacker';
      isAttacker
        ? useGameStore.getState().actions.makeAttackingMove(card.cardType)
        : useGameStore.getState().actions.makeDefensiveMove(card.cardType);
    }
  }

  animateCardMoveToTable(state: TypeGameState, prevSate: TypeGameState) {
    if (JSON.stringify(state.placedCards) !== JSON.stringify(prevSate.placedCards)) {
      const idPlayerMoved = prevSate.activeSocketId;
      const rolePlayerMoved = prevSate.players.filter(
        (player) => player.socketId === idPlayerMoved,
      )[0].playerRole;
      const cardMovedType =
        rolePlayerMoved === TypePlayerRole.Attacker
          ? state.placedCards[state.placedCards.length - 1].attacker
          : state.placedCards[state.placedCards.length - 1].defender;
      const thisplayer = this.playersSorted.filter(
        (player) => player.socketId === idPlayerMoved,
      )[0];
      const indexOfPlayer = this.playersSorted.indexOf(thisplayer);

      if (cardMovedType) {
        const spriteToMove = this.playersCardsSprites[indexOfPlayer].filter(
          (sprite) => sprite.value === this.getCardTexture(cardMovedType),
        )[0];
        const indexOfCard = this.playersCardsSprites[indexOfPlayer].indexOf(spriteToMove);
        this.playersCardsSprites[indexOfPlayer].splice(indexOfCard, 1);
        const params = {
          isAttacker: rolePlayerMoved === TypePlayerRole.Attacker,
          place: state.placedCards.length,
          me: indexOfPlayer === 0,
        };

        //если нападаю, то след кучку начинаю, иначе последнюю нечетную
        rolePlayerMoved === TypePlayerRole.Attacker
          ? this.piles.push([spriteToMove])
          : this.piles[this.piles.length - 1].push(spriteToMove);

        spriteToMove?.move(params);
      }
      this.setCardsPositions();
    }
  }

  updateTable(piles: TypePlacedCard[]) {
    if (piles.length === 4 || piles.length === 7) {
      this.piles.forEach((set, pileInd) => {
        set.forEach((card, cardInd) => card.redrawTable(cardInd, pileInd, this.piles.length));
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
      const text = new CardsText(this, textData);
      this.playersText.push(text);
    });
  }

  updatePlayersText(players: TypePlayer[]) {
    const cardsWithoutMainPlayer = [...this.playersCards];
    cardsWithoutMainPlayer.splice(0, 1);
    this.playersText.forEach((text, i) => {
      text.setText(cardsWithoutMainPlayer[i].length.toString());
    });
  }

  // setAlive(value: boolean) {
  // в конце игры - скрыть текстуру, деактивировать объекты карт, если они будут улетать на пределы экрана. если в кучке битых, то не нужно.
  // }

  // onExit() {
  //   this.playersCardsSprites.flat().forEach((card) => card.destroy());
  // }

  createBg() {
    const bg = this.add.sprite(config.width / 2, config.height / 2, 'bgDark');
    bg.depth = config.depth.bg;
  }

  createButtons() {
    this.mainButton = new Button(this);
    //переделать на красивую кнопку в отдельном классе
    const handleLeaveRoom = () => {
      useGameStore.getState().actions.leaveRoom();
      this.scene.start('End');
    };
    const leaveBtn = this.add.text(30, 30, 'leave');
    leaveBtn.setInteractive().on('pointerdown', handleLeaveRoom);
  }

  updateButton(arr: string[]) {
    const [roomStatus, activeSocketId] = arr;
    if (this.mainButton !== undefined) {
      const isFirst = useGameStore.getState().players[0].socketId === this.socketId;
      if (isFirst && roomStatus === 'WaitingForStart')
        this.mainButton.update(TypeButtonStatus.Start, true);

      const isAttacker = this.playersSorted[0].playerRole === 'Attacker';
      const isGame = roomStatus === 'GameInProgress';
      const isSocketActive = activeSocketId === this.socketId;
      const isPileOnTable = useGameStore.getState().placedCards.length != 0;
      if (isSocketActive && isAttacker && isPileOnTable)
        this.mainButton.update(TypeButtonStatus.Pass, true);
      else if (!isSocketActive && isAttacker && isPileOnTable)
        this.mainButton.update(TypeButtonStatus.Pass, false);
      else if (isGame && isSocketActive && !isAttacker)
        this.mainButton.update(TypeButtonStatus.Take, true);
      else if (isGame && !isSocketActive && !isAttacker)
        this.mainButton.update(TypeButtonStatus.Take, false);
    }
  }

  setPlayers() {
    const roomStatus = useGameStore.getState().roomStatus;
    if (
      roomStatus === TypeRoomStatus.WaitingForStart ||
      roomStatus === TypeRoomStatus.WaitingForPlayers
    ) {
      const players = useGameStore.getState().players;
      this.sortPlayers(players);
      this.createTables();
      this.createIcons();
    }
  }

  sortPlayers(players: TypePlayer[]) {
    this.playersSortedPrev = [...this.playersSorted];
    const me = players.find((player) => player.socketId === this.socketId);
    this.playersSorted = [...useGameStore.getState().players];
    if (me !== undefined) {
      while (this.playersSorted.indexOf(me) !== 0) {
        const first = this.playersSorted.shift();
        if (first !== undefined) this.playersSorted.push(first);
      }
    }
    this.playersCards = this.playersSorted.map((set) => set.cards);
  }

  createTables() {
    //пока просто переисовка, если будет время, то сделать анимацию движения столов при добавлении пользователей
    this.tables.forEach((el) => el.destroy());
    this.tables = [];
    this.tableSizes =
      this.playersSorted.length === 1
        ? config.playersTables[1]
        : this.playersSorted.length === 2
        ? config.playersTables[2]
        : this.playersSorted.length === 3
        ? config.playersTables[3]
        : config.playersTables[4];

    const params = {
      x: this.tableSizes[0].startX,
      y: config.height - this.tableSizes[0].height,
      width: this.tableSizes[0].width,
      height: this.tableSizes[0].height,
      rounded: { tl: 10, tr: 10, bl: 0, br: 0 },
    };

    for (let i = 0; i < this.playersSorted.length; i++) {
      if (i != 0) {
        params.x = this.tableSizes[i].startX;
        params.y = 0;
        params.width = this.tableSizes[i].width;
        params.height = 115; //partially visible
        params.rounded = { tl: 0, tr: 0, bl: 10, br: 10 };
      }
      const table = new Table(this, params);
      this.tables.push(table);
    }
  }

  createIcons() {
    //пока просто переисовка, если будет время, то сделать анимацию движения столов при добавлении пользователей
    if (this.icons.length !== 0) {
      this.icons.forEach((el) => el.destroy());
      this.icons = [];
    }
    //решить вопрос с назначением иконок, не должны меняться!
    for (let i = 0; i < this.playersSorted.length; i++) {
      const nickname = this.playersSorted[i].playerName;
      const socketId = this.playersSorted[i].socketId;
      const icon = new Icon(this, i, this.tableSizes, nickname, socketId);
      this.icons.push(icon);
    }
  }

  colorIcon(activeId: string) {
    if (useGameStore.getState().roomStatus === TypeRoomStatus.GameInProgress) {
      this.icons.forEach((icon) => icon.colorBorder(false));
      const activeIcon = this.icons.find((icon) => icon.socketId === activeId);
      if (activeIcon !== undefined) {
        activeIcon.colorBorder(true);
      }
    }
  }

  createDeck(deck: number) {
    //потом вынести в отдельный класс
    const max = deck > 8 ? 8 : deck - 1;
    for (let i = 0; i < max - 1; i++) {
      const card = new Card(this, 70 - i / 2, config.height / 2 - i, 'cards', 'cardBack').setAngle(
        10,
      );
      this.deckCards.push(card);
    }
    const textData = { x: 30, y: config.height / 2 - 80, amount: deck.toString() };
    this.deckText = new CardsText(this, textData);
  }

  updateDeck(deck: number) {
    if (deck < 8) {
      while (this.deckCards.length > deck) {
        this.deckCards[0].destroy();
      }
    }
    const text = deck === 1 ? '' : deck.toString();
    this.deckText?.setText(text);
  }

  createTrumpCard() {
    const texture = this.getCardTexture(this.trump);
    console.log(this.trump, texture);
    const trumpCard = new Card(this, 80, config.height / 2, 'cards', texture, this.trump)
      .setDepth(config.depth.trumpCard)
      .positionTrump();
  }

  createTrumpSuit() {
    new Suit(this, this.trump.suit);
  }

  getCardTexture(card: TypeCard) {
    const texture = { rank: '', suit: '' };
    if (card.rank <= 10) texture.rank = card.rank.toString();
    else if (card.rank === 11) texture.rank = 'J';
    else if (card.rank === 12) texture.rank = 'Q';
    else if (card.rank === 13) texture.rank = 'K';
    else texture.rank = 'A';

    if (card.suit === 'clubs') texture.suit = 'C';
    else if (card.suit === 'spades') texture.suit = 'S';
    else if (card.suit === 'hearts') texture.suit = 'H';
    else texture.suit = 'D';
    return texture.rank + texture.suit;
  }
}
