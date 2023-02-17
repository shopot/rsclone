import Phaser from 'phaser';
import { config } from '../index';
import { Hand } from '../prefabs/Hand';
import { CardsText } from '../prefabs/CardsText';
import { Card } from '../prefabs/Card';
import { Suit } from '../prefabs/Suit';
import { Button } from '../prefabs/Button';
import { socketIOService } from '../../../shared/api/socketio';
import { TypeGameState, useGameStore } from '../../../store/gameStore';
import {
  TypeCard,
  TypeChatMessage,
  TypeDealt,
  TypeGameAction,
  TypePlacedCard,
  TypePlayer,
  TypePlayerStatus,
  TypeRoomStatus,
} from '../../../shared/types';
import { Icon } from '../classes/Icon';
import { ButtonLeave } from '../prefabs/ButtonLeave';
import { StatusHelper } from '../prefabs/StatusHelper';
import { Timer } from '../prefabs/Timer';
import { Input } from 'postcss';

export const enum TypeButtonStatus {
  Start = 'Start',
  Pass = 'Pass',
  Take = 'Take',
}

export class GameScene extends Phaser.Scene {
  piles: Card[][] = [];
  playersCardsSprites: Card[][] = [];
  handSizes: { width: number; height: number; startX: number }[] = [];
  playersSorted: TypePlayer[] = [];
  playersSortedPrev: TypePlayer[] = [];
  hands: Hand[] = [];
  icons: Icon[] = [];
  deckCards: Card[] = [];
  deckText: CardsText | undefined;
  trump: TypeCard = useGameStore.getState().trumpCard;
  mainButton: Button | undefined;
  socketId = socketIOService.getSocketId();
  playersCards: TypeCard[][] = [];
  playersText: CardsText[] = [];
  dealtSprites: Card[][] = [];
  playerAmt = 0;
  prevDealt: TypeDealt[] = [];
  trumpCard: Card | undefined;
  rounds: number[] = [];
  prevPlacedCards: TypePlacedCard[] = [];
  sounds:
    | {
        placeCard: Phaser.Sound.BaseSound;
        loser: Phaser.Sound.BaseSound;
        toBeaten: Phaser.Sound.BaseSound;
        fromDeck: Phaser.Sound.BaseSound;
      }
    | undefined;
  prevState: TypeGameState | undefined;
  state: TypeGameState | undefined;
  statusHelper: StatusHelper | undefined;
  timer: Timer | undefined;
  formHtml: Phaser.GameObjects.DOMElement | undefined;
  chatText: Phaser.GameObjects.Text | undefined;
  enterKey: Phaser.Input.Keyboard.Key | undefined;

  constructor() {
    super('Game');
    // setPlayers
    useGameStore.subscribe(
      (state) => state.players.length,
      () => this.setPlayers(),
    );

    // sortPlayersData
    useGameStore.subscribe(
      (state) => state.players,
      (data) => this.sortPlayersData(data),
    );

    // updateButton
    useGameStore.subscribe(
      (state) => [state.roomStatus, state.activeSocketId],
      (arr) => this.updateButton(arr),
    );

    // handleRoomStatus
    useGameStore.subscribe(
      (state) => state.roomStatus,
      (data) => void this.handleRoomStatus(data),
    );

    // colorIcon
    useGameStore.subscribe(
      (state) => state.activeSocketId,
      (data) => this.colorIcon(data),
    );

    // handleActions
    useGameStore.subscribe(
      (state) => state,
      (state, prevState) => void this.handleActions(state, prevState),
    );

    // saveTableCards
    useGameStore.subscribe(
      (state) => state.placedCards,
      (piles, prevPiles) => this.saveTableCards(piles, prevPiles),
    );
  }

  create() {
    //добавить в стейт выбор темы и тогда грузить светлый или темный бг
    this.createBg();
    this.createButtons();
    this.setPlayers();
    this.createDeck(useGameStore.getState().deckCounter);
    this.createSounds();
    this.createChat();
  }

  createChat() {
    this.formHtml = this.add
      .dom(config.width - 255, 450)
      .createFromCache('formHtml')
      .setOrigin(0);

    this.chatText = this.add
      .text(config.width - 255, 250, 'Hello!', {
        backgroundColor: '#E7F0F9',
        color: '#000',
        font: '18px Arial',
      })
      .setPadding(10)
      .setFixedSize(250, 245)
      .setAlign('justify');
    // .setWordWrapWidth(245, true);

    this.enterKey = this.input.keyboard
      .addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      .on('down', (event: KeyboardEvent) => {
        const formInput = this.formHtml?.getChildByName('chat');
        if (formInput instanceof HTMLInputElement && formInput.value !== '') {
          useGameStore.getState().actions.sendMessage(formInput.value);
          formInput.value = '';
        }
      });
  }
  updateChat(chatContent: TypeChatMessage[]) {
    const chat: string[] = [];
    const LINES = 9;
    const COLS = 29;
    chatContent.forEach((el) => {
      const str = `${el.sender.playerName}: ${el.message}`;
      const strToArr = str.split(' ');
      const copyArr = [...strToArr];

      const splitWords = (arr: string[]) => {
        let text = arr[0];
        for (let i = 1; i < arr.length; i++) {
          if ((text + arr[i]).length < COLS) {
            text = text + ' ' + arr[i];
          } else {
            return { str: text, ind: i };
          }
        }
        return { str: '', ind: 0 };
      };

      while (copyArr.join(' ').length > COLS) {
        const partiallySplit = splitWords(copyArr);
        chat.push(partiallySplit.str);
        copyArr.splice(0, partiallySplit.ind);
      }
      chat.push(copyArr.join(' '));
    });
    while (chat.length > LINES) {
      chat.shift();
    }
    this.chatText?.setText(chat);
  }

  createSounds() {
    this.sounds = {
      placeCard: this.sound.add('placeCard'),
      loser: this.sound.add('loser'),
      toBeaten: this.sound.add('toBeaten'),
      fromDeck: this.sound.add('fromDeck'),
    };
  }

  //подписка на румстатус
  async handleRoomStatus(roomStatus: TypeRoomStatus) {
    if (roomStatus === TypeRoomStatus.GameInProgress) await this.startGame();
    if (roomStatus === TypeRoomStatus.GameIsOver) this.endGame();
  }

  endGame() {
    this.scene.start('End');
    //сделать модалку
  }

  //подписка на статус целиком. если только на экшены, то они могут не меняться, если несколько игроков делают пасс
  async handleActions(state: TypeGameState, prevState: TypeGameState) {
    this.prevState = prevState;
    this.state = state;
    if (JSON.stringify(state.chat) !== JSON.stringify(prevState.chat)) {
      this.updateChat(state.chat);
    }
    if (state.lastGameAction === TypeGameAction.DefenderDecidesToPickUp) {
      this.createBubble('Take');
      this.updateHelper('takes');
    } else if (
      state.lastGameAction === TypeGameAction.AttackerPass ||
      state.lastGameAction === TypeGameAction.DefenderTakesCards
    ) {
      this.createBubble('Pass');
      this.updateHelper('passes');
    }
    if (
      JSON.stringify(state.lastCloseDefenderCard) !==
        JSON.stringify(prevState.lastCloseDefenderCard) ||
      JSON.stringify(state.lastOpenAttackerCard) !== JSON.stringify(prevState.lastOpenAttackerCard)
    ) {
      await this.handleClick();
    } else if (
      JSON.stringify(state.lastCloseDefenderCard) ===
        JSON.stringify(prevState.lastCloseDefenderCard) &&
      JSON.stringify(state.lastOpenAttackerCard) === JSON.stringify(prevState.lastOpenAttackerCard)
    ) {
      if (state.lastGameAction === TypeGameAction.AttackerPass && state.placedCards.length === 0) {
        await this.handlePass();
      } else if (state.lastGameAction === TypeGameAction.DefenderTakesCards) {
        await this.handleTake();
      }
      await this.checkDealt(state.dealt);
    }
    this.colorNickname();
  }

  colorNickname() {
    const playersRoles = this.playersSorted.map((player) => player.playerRole);
    this.icons.forEach((icon, ind) => {
      icon.colorCloud(playersRoles[ind]);
    });
  }

  updateHelper(status: string) {
    const activeIDd = this.prevState?.activeSocketId;
    const nickname = this.prevState?.players.find(
      (player) => player.socketId === activeIDd,
    )?.playerName;
    if (nickname) {
      if (activeIDd !== this.socketId) this.statusHelper?.setStatus(nickname, status);
      else if (activeIDd === this.socketId) this.statusHelper?.setStatus('', '');
    }
  }

  saveTableCards(prevPlaced: TypePlacedCard[], currPlaced: TypePlacedCard[]) {
    this.prevPlacedCards = prevPlaced;
  }

  async handleTake() {
    console.log('``````handle take````````````');
    const spriteValueFromPile = this.piles.flat()[0].value;

    let defenderInd = -1;
    this.playersCards.forEach((arr) => {
      arr.forEach((el) => {
        if (this.getCardTexture(el) === spriteValueFromPile) {
          defenderInd = this.playersCards.indexOf(arr);
        }
      });
    });
    for (const card of this.piles.flat()) {
      card.setAngle(0);
      await card.animateToPlayer(defenderInd, this.playerAmt);
      this.playersCardsSprites[defenderInd].push(card);
    }
    this.piles = [];
    this.setEqualPositionAtHands();
    this.updatePlayersText();
  }

  createBubble(text: string) {
    const prevActiveIcon = this.icons.find(
      (icon) => icon.socketId === this.prevState?.activeSocketId,
    );
    if (prevActiveIcon !== undefined) {
      const me = this.prevState?.activeSocketId === this.socketId;
      prevActiveIcon.createBubble(text, me);
    }
  }
  async handlePass() {
    console.log('````````````handle pass````````````````');

    const angle = 180 / (this.piles.flat().length + 1);
    for (const card of this.piles.flat()) {
      const ind = this.piles.flat().indexOf(card);
      this.sounds?.toBeaten.play({ volume: 0.5 });
      await card.animateToBeaten(angle + ind * angle, ind);
    }
    this.piles = [];
  }

  async handleClick() {
    this.sounds?.placeCard.play({ volume: 0.5 });
    console.log('`````````handle click`````````````');
    const params = { isAttacker: false, cardToMoveValue: '', pileInd: -1, pileLength: 0 };

    params.isAttacker = this.state?.lastGameAction === TypeGameAction.AttackerMoveCard;
    params.pileInd = params.isAttacker ? this.piles.length : this.piles.length - 1;
    console.log(this.piles);
    params.pileLength = params.isAttacker ? this.piles.length + 1 : this.piles.length;
    const prevActivePlayerID = this.prevState?.activeSocketId || '';
    const isMe = prevActivePlayerID === this.socketId;
    //если есть карты на столе в текущем стейте (не бито, не тейк)
    if (this.state?.placedCards.length !== 0) {
      console.log('normal');
      const cardToMoveType = params.isAttacker
        ? this.state?.lastOpenAttackerCard
        : this.state?.lastCloseDefenderCard;
      if (cardToMoveType) {
        params.cardToMoveValue = this.getCardTexture(cardToMoveType);
      }
    }

    //если нет карт на столе, и нет в битых - 1 вар - тейк (автоматом, включая, когда докидали до 6)
    else if (
      this.state?.placedCards.length === 0 &&
      this.state?.lastGameAction === TypeGameAction.DefenderTakesCards
    ) {
      console.log('autotake');
      params.isAttacker = true;
      const cardToMoveType = this.state?.lastOpenAttackerCard;
      if (cardToMoveType) {
        params.cardToMoveValue = this.getCardTexture(cardToMoveType);
      }
      params.pileInd = params.isAttacker ? this.piles.length : this.piles.length - 1;
      // params.pileInd = 5;
      // params.pileLength = 6;
      params.pileLength = params.isAttacker ? this.piles.length + 1 : this.piles.length;
    }

    //если нет карт на столе, и нет в битых - 2 вар - побил все накинутые
    else if (
      this.state?.placedCards.length === 0 &&
      this.state?.lastGameAction === TypeGameAction.DefenderMoveCard
    ) {
      console.log('скинул послденюю');
      params.isAttacker = false;
      const cardToMoveType = this.state?.lastCloseDefenderCard;
      if (cardToMoveType) {
        params.cardToMoveValue = this.getCardTexture(cardToMoveType);
      }
    }
    console.log(params, 'params');
    const sprite = this.playersCardsSprites
      .flat()
      .filter((card) => card.value === params.cardToMoveValue)[0];
    await sprite.animateToTable(params.pileInd, params.isAttacker, params.pileLength, isMe);
    console.log(sprite, 'sprite');

    const player = this.playersCardsSprites.filter((arr) => arr.includes(sprite))[0];
    console.log(player, 'player');

    const playerInd = this.playersCardsSprites.indexOf(player);
    console.log(playerInd, 'playerInd');

    const spriteInd = this.playersCardsSprites[playerInd].indexOf(sprite);
    console.log(spriteInd, 'spriteInd');

    this.playersCardsSprites[playerInd].splice(spriteInd, 1);
    params.isAttacker ? this.piles.push([sprite]) : this.piles[params.pileLength - 1].push(sprite);
    console.log(this.playersCardsSprites[playerInd], 'this.playersCardsSprites[playerInd]');
    this.setEqualPositionAtHands();
    this.updatePlayersText();
    await this.updateCardsPosOnTable();

    //далее перенаправляем на тейк и пасс, если есть
    if (
      this.state?.lastGameAction === TypeGameAction.AttackerPass &&
      this.state.placedCards.length === 0
    ) {
      await this.handlePass();
      await this.checkDealt(this.state.dealt);
    } else if (this.state?.lastGameAction === TypeGameAction.DefenderTakesCards) {
      await this.handleTake();
      await this.checkDealt(this.state.dealt);
    } else if (
      this.state?.lastGameAction === TypeGameAction.DefenderMoveCard &&
      this.state.placedCards.length === 0
    ) {
      await this.handlePass();
      await this.checkDealt(this.state.dealt);
    }
  }

  handleWrongClick() {
    //определить, кто нажимал ранее и у него проигрывать звук неправильного клика
  }

  // highlightCards() {
  //   //вызвать, когда мой статут фо1лс и кинута карта (pile имеет нечетные подмассивы)
  //   //подсветит, чем можно бить по возрастанию
  //   //когда мой статус тру и у меня есть карты того же значения, что и на столе
  //   //подсветит такие же карты, чтобы подкинуть
  //   [...this.playersCardsSprites].flat().forEach((card) => card.removeHighlight());
  //   const targets = [this.playersCardsSprites[0][5], this.playersCardsSprites[0][10]];
  //   targets.forEach((card) => card.highlight());
  // }

  createBg() {
    const bg = this.add.sprite(config.width / 2, config.height / 2, 'bgDark');
    bg.depth = config.depth.bg;
  }

  createButtons() {
    this.mainButton = new Button(this);
    new ButtonLeave(this);
  }

  update() {
    if (this.piles.length === 0 && this.state?.placedCards.length === 0) {
      setTimeout(() => {
        this.statusHelper?.setStatus('', '');
      }, 1000);
    }
  }

  //подписка на [state.roomStatus, state.activeSocketId]
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

      //если победил, то статус может не соответсвовать!!!
      const me = useGameStore
        .getState()
        .players.filter((player) => player.socketId === this.socketId)[0];

      if (me.playerStatus === TypePlayerStatus.YouWinner) {
        this.mainButton.update(TypeButtonStatus.Take, false);
      }
    }
  }

  //подписка на state.players.length
  setPlayers() {
    const roomStatus = useGameStore.getState().roomStatus;
    if (
      roomStatus === TypeRoomStatus.WaitingForStart ||
      roomStatus === TypeRoomStatus.WaitingForPlayers
    ) {
      const players = useGameStore.getState().players;
      this.playerAmt = players.length;
      this.sortPlayersData(players);
      this.createHands();
      this.createIcons();
      this.createHelper();
    }
  }

  createHelper() {
    this.statusHelper = new StatusHelper(this);
  }
  //подписка на state.players
  sortPlayersData(players: TypePlayer[]) {
    this.playersSortedPrev = [...this.playersSorted];
    const me = players.find((player) => player.socketId === this.socketId);
    this.playersSorted = [...useGameStore.getState().players];
    if (me !== undefined) {
      while (this.playersSorted.indexOf(me) !== 0) {
        const first = this.playersSorted.shift();
        if (first !== undefined) this.playersSorted.push(first);
      }

      //для победителя сделать модалку
      if (me.playerStatus === TypePlayerStatus.YouWinner) {
        console.log('WINNER');
      }
    }
    this.playersCards = this.playersSorted.map((set) => set.cards);
  }

  createHands() {
    //пока просто переисовка, если будет время, то сделать анимацию движения столов при добавлении пользователей
    this.hands.forEach((el) => el.destroy());
    this.hands = [];
    this.handSizes =
      this.playersSorted.length === 1
        ? config.playersHands[1]
        : this.playersSorted.length === 2
        ? config.playersHands[2]
        : this.playersSorted.length === 3
        ? config.playersHands[3]
        : config.playersHands[4];

    const params = {
      x: this.handSizes[0].startX,
      y: config.height - this.handSizes[0].height,
      width: this.handSizes[0].width,
      height: this.handSizes[0].height,
      rounded: { tl: 10, tr: 10, bl: 0, br: 0 },
    };

    for (let i = 0; i < this.playersSorted.length; i++) {
      if (i != 0) {
        params.x = this.handSizes[i].startX;
        params.y = 0;
        params.width = this.handSizes[i].width;
        params.height = 115; //partially visible
        params.rounded = { tl: 0, tr: 0, bl: 10, br: 10 };
      }
      const hand = new Hand(this, params);
      this.hands.push(hand);
    }
  }

  createIcons() {
    //пока просто переисовка, если будет время, то сделать анимацию движения столов при добавлении пользователей
    if (this.icons.length !== 0) {
      this.icons.forEach((el) => el.destroy());
      this.icons = [];
    }
    for (let i = 0; i < this.playersSorted.length; i++) {
      const nickname = this.playersSorted[i].playerName;
      const socketId = this.playersSorted[i].socketId;
      const avatar = this.playersSorted[i].playerAvatar;
      const icon = new Icon(this, i, this.handSizes, nickname, socketId, avatar);
      this.icons.push(icon);
    }
  }

  //подписка на state.activeSocketId
  colorIcon(activeId: string) {
    if (useGameStore.getState().roomStatus === TypeRoomStatus.GameInProgress) {
      this.icons.forEach((icon) => icon.colorBorder(false));
      const activeIcon = this.icons.find((icon) => icon.socketId === activeId);
      if (activeIcon !== undefined) {
        activeIcon.colorBorder(true);
      }
    }
  }

  createDeck(deckAmt: number) {
    for (let i = 0; i < 8; i++) {
      const card = new Card(this, 0, 0, 'cards', 'cardBack');
      card.positionDeck(i);
      this.deckCards.push(card);
    }
    const textData = { x: 30, y: config.height / 2 - 80, amount: deckAmt.toString() };
    this.deckText = new CardsText(this, textData).setDepth(100);
  }

  async createTrumpCard() {
    const texture = this.getCardTexture(this.trump);
    this.trumpCard = new Card(this, 80, config.height / 2, 'cards', texture, this.trump);
    await this.trumpCard.positionTrump();
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

  //подписка на state.roomStatus
  async startGame() {
    this.trump = useGameStore.getState().trumpCard;
    this.createTrumpSuit();
    this.createTimer();
    await this.createTrumpCard();
    await this.createCardSprites(useGameStore.getState().dealt, 1);
    this.createCardsText();
    //иначе, если до игры он же был активный, то не меняется
    this.colorIcon(useGameStore.getState().activeSocketId);
  }

  createTimer() {
    this.timer = new Timer(this, this.handSizes[0]);
  }

  //подписка на state.dealt - убрать из подписки, вызывать вручную!!!!
  async checkDealt(dealt: TypeDealt[]) {
    const dealtCards = [...dealt].map((obj) => obj.cards).flat();
    const round = useGameStore.getState().currentRound;
    const isNew = JSON.stringify(this.prevDealt) !== JSON.stringify(dealt);
    if (dealtCards.length !== 0 && round > 1 && isNew) {
      await this.createCardSprites(dealt, round);
      this.prevDealt = dealt;
    }
  }

  async createCardSprites(dealt: TypeDealt[], round: number) {
    //= создание новых спрайтов, если идет раздача из колоды
    const sortedDealt: TypeCard[][] = [];
    const playersId = [...this.playersSorted].map((data) => data.socketId);
    playersId.forEach((id) => {
      const cardsArr = [...dealt].filter((info) => info.socketId === id)[0].cards;
      sortedDealt.push(cardsArr);
    });
    sortedDealt.forEach((set, ind) => {
      const arr: Card[] = [];
      set.forEach((el) => {
        const item = new Card(this, 0, 0, 'cards', this.getCardTexture(el), el);
        item.positionDeckCard(ind === 0);
        arr.push(item);
        if (round > 1) this.playersCardsSprites[ind].push(item);
      });
      this.dealtSprites.push(arr);
      if (round <= 1) this.playersCardsSprites.push(arr);
    });
    await this.animateFromDeckToPlayers();
  }

  async animateFromDeckToPlayers() {
    await Promise.all(
      this.dealtSprites.map(async (arr) => {
        for (const sprite of arr) {
          await sprite.animateToPlayer(this.dealtSprites.indexOf(arr), this.dealtSprites.length);
        }
      }),
    );

    this.setEqualPositionAtHands();
    this.dealtSprites = [];
    this.updateDeck();
    this.updatePlayersText();
  }

  updateDeck() {
    const deckAmt = useGameStore.getState().deckCounter;
    if (deckAmt < 8) {
      this.deckCards.forEach((card) => card.destroy());
      if (deckAmt > 1) {
        for (let i = 0; i < deckAmt - 1; i++) {
          const card = new Card(this, 0, 0, 'cards', 'cardBack');
          card.positionDeck(i);
          this.deckCards.push(card);
        }
      } else if (deckAmt === 0) this.trumpCard?.destroy();
    }
    const text = deckAmt <= 1 ? '' : deckAmt.toString();
    this.deckText?.setText(text);
  }

  createCardsText() {
    const textData = { x: 0, y: 70, amount: '' };
    const cardsWithoutMainPlayer = [...this.playersCards];
    cardsWithoutMainPlayer.splice(0, 1);
    cardsWithoutMainPlayer.forEach((set, i) => {
      textData.x = this.handSizes[i + 1].startX + 20;
      if (set.length != 0) textData.amount = set.length.toString();
      const text = new CardsText(this, textData);
      text.setDepth(100);
      this.playersText.push(text);
    });
  }

  updatePlayersText() {
    const cardsWithoutMainPlayer = [...this.playersCards];
    cardsWithoutMainPlayer.splice(0, 1);
    this.playersText.forEach((text, i) => {
      text.setText(cardsWithoutMainPlayer[i].length.toString());
    });
  }

  async updateCardsPosOnTable() {
    if (this.piles.length === 4 || this.piles.length === 7) {
      await Promise.all(
        this.piles.map(async (set, pileInd) => {
          await Promise.all(
            set.map(async (card, cardInd) => {
              await card.redrawTable(cardInd, pileInd, this.piles.length);
            }),
          );
        }),
      );
    }
  }

  setEqualPositionAtHands() {
    const border = 8;
    const handSize = { ...this.handSizes[0] };
    this.playersCardsSprites.forEach((set, i) => {
      handSize.startX = this.handSizes[i].startX;
      handSize.width = this.handSizes[i].width;
      const shift = (handSize.width - border * 2 - config.cardSize.w) / (set.length - 1);
      const y = i === 0 ? config.height - config.cardSize.h / 2 : 30; //partially visible

      set.forEach((card, ind) => {
        let x = handSize.startX + config.cardSize.w / 2 + ind * shift + border;
        if (set.length === 1) x = handSize.startX + config.cardSize.w / 2 + border;
        card.setPosition(x, y);
        card.setDepth(ind + 1);
      });
    });
  }
}
