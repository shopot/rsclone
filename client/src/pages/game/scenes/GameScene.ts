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
  TypeDealt,
  TypeGameAction,
  TypePlacedCard,
  TypePlayer,
  TypePlayerRole,
  TypeRoomStatus,
} from '../../../shared/types';
import { Icon } from '../classes/Icon';
import { ButtonLeave } from '../prefabs/ButtonLeave';

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

  constructor() {
    super('Game');
    const setPlayers = useGameStore.subscribe(
      (state) => state.players.length,
      (data) => this.setPlayers(),
    );

    const sortPlayersData = useGameStore.subscribe(
      (state) => state.players,
      (data) => this.sortPlayersData(data),
    );

    const updateButton = useGameStore.subscribe(
      (state) => [state.roomStatus, state.activeSocketId],
      (arr) => this.updateButton(arr),
    );

    const handleRoomStatus = useGameStore.subscribe(
      (state) => state.roomStatus,
      (data) => this.handleRoomStatus(data),
    );

    const colorIcon = useGameStore.subscribe(
      (state) => state.activeSocketId,
      (data) => this.colorIcon(data),
    );

    const createNewAnimateFromDeck = useGameStore.subscribe(
      (state) => state.dealt,
      (data) => this.checkDealt(data),
    );

    const handleActions = useGameStore.subscribe(
      (state) => state,
      (data) => this.handleActions(data),
    );

    const saveTableCards = useGameStore.subscribe(
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
  async handleActions(state: TypeGameState) {
    if (
      state.lastGameAction === TypeGameAction.AttackerMoveCardFailed ||
      state.lastGameAction === TypeGameAction.DefenderMoveCardFailed
    ) {
      this.handleWrongClick();
    } else if (
      state.lastGameAction === TypeGameAction.AttackerMoveCard ||
      state.lastGameAction === TypeGameAction.DefenderMoveCard
    ) {
      await this.handleClick(state.lastGameAction);
    } else if (
      state.lastGameAction === TypeGameAction.AttackerPass &&
      state.placedCards.length === 0
    ) {
      await this.handlePass();
    } else if (
      state.lastGameAction === TypeGameAction.DefenderTakesCards &&
      state.placedCards.length === 0
    ) {
      await this.handleTake();
    }
  }

  saveTableCards(prevPlaced: TypePlacedCard[], currPlaced: TypePlacedCard[]) {
    this.prevPlacedCards = prevPlaced;
  }

  async handleTake() {
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
    // const playersCardsValues = this.playersCards.map((arr) => {
    //   arr.map((type) => this.getCardTexture(type));
    // });
    // const defender = this.playersCards.filter((arr) => arr.includes(spriteValueFromPile))[0];
    // const defenderInd = this.playersCards.indexOf(defender);

    // const defender = this.playersSortedPrev.filter(
    //   (player) => player.playerRole === TypePlayerRole.Defender,
    // )[0];
    // const defender = this.playersSorted.filter(
    //   (player) => player.playerRole === TypePlayerRole.Defender,
    // )[0];
    // const defenderInd = this.playersSorted.indexOf(defender);
  }

  async handlePass() {
    const angle = 180 / (this.piles.flat().length + 1);
    for (const card of this.piles.flat()) {
      const ind = this.piles.flat().indexOf(card);
      await card.animateToBeaten(angle + ind * angle, ind);
    }
    this.piles = [];
  }

  async handleClick(lastAction: TypeGameAction) {
    const isAttacker = lastAction === TypeGameAction.AttackerMoveCard;
    const currPlaced = useGameStore.getState().placedCards;
    const piles = currPlaced.length !== 0 ? currPlaced : this.prevPlacedCards;
    const pileToMove = isAttacker
      ? piles.filter((obj) => obj.defender === null)[0]
      : piles[piles.length - 1];
    const pileInd = piles.indexOf(pileToMove);
    const spriteType = isAttacker ? piles[pileInd].attacker : piles[pileInd].defender;
    const sprite = this.playersCardsSprites
      .flat()
      .filter((card) => JSON.stringify(card.cardType) === JSON.stringify(spriteType))[0];
    const player = this.playersCardsSprites.filter((arr) => arr.includes(sprite))[0];
    const playerInd = this.playersCardsSprites.indexOf(player);
    const me = playerInd === 0;
    const spriteInd = player.indexOf(sprite);
    if (this.playersCardsSprites[playerInd].length !== 0) {
      this.playersCardsSprites[playerInd].splice(spriteInd, 1);
    } else {
      this.playersCardsSprites[playerInd] = [];
    }
    isAttacker ? this.piles.push([sprite]) : this.piles[this.piles.length - 1].push(sprite);
    await sprite.animateToTable(pileInd, isAttacker, piles.length, me);
    this.setEqualPositionAtHands();
    this.updatePlayersText();
    await this.updateCardsPosOnTable();
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
    const leaveBtn = new ButtonLeave(this);
    //переделать на красивую кнопку в отдельном классе
    // const handleLeaveRoom = () => {
    //   useGameStore.getState().actions.leaveRoom();
    //   this.scene.start('End');
    // };
    // const leaveBtn = this.add.text(30, 30, 'leave');
    // leaveBtn.setInteractive().on('pointerdown', handleLeaveRoom);
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
    }
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
    await this.createTrumpCard();
    await this.createCardSprites(useGameStore.getState().dealt, 1);
    this.createCardsText();
    //иначе, если до игры он же был активный, то не меняется
    this.colorIcon(useGameStore.getState().activeSocketId);
  }

  //подписка на state.dealt
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
    //если будет время, сделать чередование карт, а не сначала одному, потом другому
    //если будет время, сохранять самой карты в колоде и по одной убирать
    for (const arr of this.dealtSprites) {
      for (const sprite of arr) {
        await sprite.animateToPlayer(this.dealtSprites.indexOf(arr), this.dealtSprites.length);
      }
    }
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
      // for (const pile of this.piles) {
      //   for (const card of pile) {
      //     await card.redrawTable(pile.indexOf(card), this.piles.indexOf(pile), this.piles.length);
      //   }
      // }
      this.piles.forEach((set, pileInd) => {
        set.forEach(
          async (card, cardInd) => await card.redrawTable(cardInd, pileInd, this.piles.length),
        );
      });
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
