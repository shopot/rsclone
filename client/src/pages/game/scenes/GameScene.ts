import Phaser from 'phaser';
import { config } from '../index';
import { Hand } from '../prefabs/Hand';
import { CardsText } from '../prefabs/CardsText';
import { Card } from '../prefabs/Card';
import { Suit } from '../prefabs/Suit';
import { Button } from '../classes/Button';
import { socketIOService } from '../../../shared/api/socketio';
import { useGameStore } from '../../../store/gameStore';
import {
  TypeCard,
  TypeDealt,
  TypeGameAction,
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
  piles: Card[][] = []; // стопочек на столе
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

    // const updateDeck = useGameStore.subscribe(
    //   (state) => state.deckCounter,
    //   (data) => this.updateDeck(data),
    // );
    // const updatePlayersText = useGameStore.subscribe(
    //   (state) => state.players,
    //   (data) => this.updatePlayersText(data),
    // );

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

    // const animateCardMoveToTable = useGameStore.subscribe(
    //   (state) => state,
    //   (state, prevState) => this.animateCardMoveToTable(state, prevState),
    // );

    // const updateCardsPositionOnTable = useGameStore.subscribe(
    //   (state) => state.placedCards,
    //   (data) => this.updateCardsPosOnTable(data),
    // );

    // const handleDealt = useGameStore.subscribe(
    //   (state) => state.dealt,
    //   (data) => this.handleDealt(data),
    // );

    const createNewAnimateFromDeck = useGameStore.subscribe(
      (state) => state.dealt,
      (data) => this.checkDealt(data),
    );

    const handleActions = useGameStore.subscribe(
      (state) => state.lastGameAction,
      (data) => this.handleActions(data),
    );
  }

  create() {
    //добавить в стейт выбор темы и тогда грузить светлый или темный бг
    this.createBg();
    this.createButtons();
    this.setPlayers();
    this.createDeck(useGameStore.getState().deckCounter);
  }

  async handleActions(lastAction: TypeGameAction) {
    if (
      lastAction === TypeGameAction.AttackerMoveCardFailed ||
      lastAction === TypeGameAction.DefenderMoveCardFailed
    ) {
      this.handleWrongClick();
    } else if (
      lastAction === TypeGameAction.AttackerMoveCard ||
      lastAction === TypeGameAction.DefenderMoveCard
    ) {
      await this.handleClick(lastAction);
    } else if (lastAction === TypeGameAction.AttackerPass) {
      await this.handlePass();
    } else if (lastAction === TypeGameAction.DefenderTakesCards) {
      await this.handleTake();
    }
  }

  async handleTake() {
    const defender = this.playersSorted.filter(
      (player) => player.playerRole === TypePlayerRole.Defender,
    )[0];
    const defenderInd = this.playersSorted.indexOf(defender);
    for (const card of this.piles.flat()) {
      card.setAngle(0);
      await card.animateToPlayer(defenderInd, this.playerAmt);
      this.playersCardsSprites[defenderInd].push(card);
    }
    this.piles = [];
    this.setEqualPositionAtHands();
    this.updatePlayersText();
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
    const piles = useGameStore.getState().placedCards;
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
    this.playersCardsSprites[playerInd].splice(spriteInd, 1);
    isAttacker ? this.piles.push([sprite]) : this.piles[this.piles.length - 1].push(sprite);
    await sprite.animateToTable(pileInd, isAttacker, piles.length, me);
    this.setEqualPositionAtHands();
    this.updatePlayersText();
    await this.updateCardsPosOnTable();
  }

  handleWrongClick() {
    //определить, кто нажимал ранее и у него проигрывать звук неправильного клика
  }

  //подписка на state.dealt
  // async handleDealt(dealt: TypeDealt[]) {
  //   console.log('handleDealt');
  //   const dealtCards = [...dealt].map((obj) => obj.cards);
  //   if (useGameStore.getState().currentRound > 1 && dealtCards.some((arr) => arr.length !== 0)) {
  //     const sortedDealt: TypeCard[][] = [];
  //     const playersId = [...this.playersSorted].map((data) => data.socketId);
  //     playersId.forEach((id) => {
  //       const item = [...dealt].filter((info) => info.socketId === id)[0].cards;
  //       sortedDealt.push(item);
  //     });

  //     //Todo: отрисовать добавление спрайтов некоторым из колоды, некоторым со стола
  //     //определить был ли тейк
  //     const cardTextureFromTable = [...this.piles].flat()[0].value;
  //     const newPlayersCards = [...this.playersCards].map((set) =>
  //       set.map((card) => this.getCardTexture(card)),
  //     );
  //     const wasTake = newPlayersCards.some((arr) => arr.includes(cardTextureFromTable));
  //     console.log('was take', wasTake);
  //     //если take, то переместить спрайты со стола этому игроку, другому из делт отрисовать и перенести из стопки
  //     if (wasTake) {
  //       const playerTakingCards = newPlayersCards.filter((arr) =>
  //         arr.includes(cardTextureFromTable),
  //       )[0];
  //       const playerTakingIndex = newPlayersCards.indexOf(playerTakingCards);
  //       await this.handleTake(sortedDealt, playerTakingIndex).then(() =>
  //         this.getEqualPositionAtHands(),
  //       );
  //     }
  //   }
  // }

  // async handleTake(sortedDealtcards: TypeCard[][], playerTakingIndex: number) {
  //   console.log('handle take');
  //   console.log(this.piles, 'pile');
  //   for (const sprite of this.piles.flat()) {
  //     console.log(sprite, 'sprite form pile');
  //     this.playersCardsSprites[playerTakingIndex].push(sprite);
  //     await sprite.animateToPlayer(playerTakingIndex, sortedDealtcards.length);
  //     if (playerTakingIndex === 0) sprite.makeClickable();
  //   }
  //   this.piles = [];
  //   await this.handleDealFromDeck(sortedDealtcards, playerTakingIndex);
  // }

  // async handleDealFromDeck(sortedDealtcards: TypeCard[][], excludeInd: number) {
  //   //для каждого иргока кроме указанного создать спрайты, повернуть рубашкой вверх, добавить из в массив спрайтов игроков и массив раздаваемых спрайтов
  //   console.log('handleDealFromDeck');
  //   console.log(sortedDealtcards, 'sortedDealtcards');
  //   sortedDealtcards.forEach((set, ind) => {
  //     const arr: Card[] = [];
  //     if (ind !== excludeInd || set.length !== 0) {
  //       set.forEach((el) => {
  //         const item = new Card(this, 70, config.height / 2, 'cards', this.getCardTexture(el), el);
  //         item.close();
  //         if (ind !== 0) item.makeNotClickable();
  //         this.playersCardsSprites[ind].push(item);
  //         arr.push(item);
  //       });
  //     }
  //     this.dealtSprites.push(arr);
  //   });
  //   //анимировать перемещенеи спрайтов из колоды на стол игроков, для главноего повернуть лицом
  //   for (const arr of this.dealtSprites) {
  //     for (const sprite of arr) {
  //       await sprite.animateToPlayer(this.dealtSprites.indexOf(arr), sortedDealtcards.length);
  //     }
  //   }
  //   this.dealtSprites = [];
  //   // this.input.on('gameobjectdown', this.makeMove.bind(this));
  // }

  // highlightCards() {
  //   //вызвать, когда мой статут фо1лс и кинута карта (pile имеет нечетные подмассивы)
  //   //подсветит, чем можно бить по возрастанию
  //   //когда мой статус тру и у меня есть карты того же значения, что и на столе
  //   //подсветит такие же карты, чтобы подкинуть
  //   [...this.playersCardsSprites].flat().forEach((card) => card.removeHighlight());
  //   const targets = [this.playersCardsSprites[0][5], this.playersCardsSprites[0][10]];
  //   targets.forEach((card) => card.highlight());
  // }

  // createBeaten() {
  //   //временно создаю спрайты, потом будут анимироваться со стола
  //   const centerX = config.width;
  //   const centerY = config.height / 2 - 20;
  //   const angle = 180 / (this.beaten + 1);
  //   for (let i = 0; i < this.beaten; i++) {
  //     this.add
  //       .sprite(centerX, centerY, 'cards', 'cardBack')
  //       .setScale(0.7)
  //       .setAngle(angle + i * angle);
  //   }
  // }

  //подписка на state
  // animateCardMoveToTable(state: TypeGameState, prevSate: TypeGameState) {
  //   if (
  //     JSON.stringify(state.placedCards) !== JSON.stringify(prevSate.placedCards) &&
  //     state.placedCards.length !== 0
  //   ) {
  //     const idPlayerMoved = prevSate.activeSocketId;
  //     const rolePlayerMoved = prevSate.players.filter(
  //       (player) => player.socketId === idPlayerMoved,
  //     )[0].playerRole;
  //     const cardMovedType =
  //       rolePlayerMoved === TypePlayerRole.Attacker
  //         ? state.placedCards[state.placedCards.length - 1].attacker
  //         : state.placedCards[state.placedCards.length - 1].defender;
  //     const thisplayer = this.playersSorted.filter(
  //       (player) => player.socketId === idPlayerMoved,
  //     )[0];
  //     const indexOfPlayer = this.playersSorted.indexOf(thisplayer);

  //     if (cardMovedType) {
  //       const spriteToMove = this.playersCardsSprites[indexOfPlayer].filter(
  //         (sprite) => sprite.value === this.getCardTexture(cardMovedType),
  //       )[0];
  //       const indexOfCard = this.playersCardsSprites[indexOfPlayer].indexOf(spriteToMove);
  //       this.playersCardsSprites[indexOfPlayer].splice(indexOfCard, 1);
  //       const params = {
  //         isAttacker: rolePlayerMoved === TypePlayerRole.Attacker,
  //         place: state.placedCards.length,
  //         me: indexOfPlayer === 0,
  //       };

  //       //если нападаю, то след кучку начинаю, иначе последнюю нечетную
  //       rolePlayerMoved === TypePlayerRole.Attacker
  //         ? this.piles.push([spriteToMove])
  //         : this.piles[this.piles.length - 1].push(spriteToMove);

  //       spriteToMove?.move(params);
  //     }
  //     this.getEqualPositionAtHands();
  //   }
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
    //решить вопрос с назначением иконок, не должны меняться!
    for (let i = 0; i < this.playersSorted.length; i++) {
      const nickname = this.playersSorted[i].playerName;
      const socketId = this.playersSorted[i].socketId;
      const icon = new Icon(this, i, this.handSizes, nickname, socketId);
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

  createDeck(deck: number) {
    //потом вынести в отдельный класс
    const max = deck > 8 ? 8 : deck - 1;
    for (let i = 0; i < max - 1; i++) {
      const card = new Card(this, 70 - i / 2, config.height / 2 - i, 'cards', 'cardBack').setAngle(
        10,
      );
      card.makeNotClickable();
      this.deckCards.push(card);
    }
    const textData = { x: 30, y: config.height / 2 - 80, amount: deck.toString() };
    this.deckText = new CardsText(this, textData).setDepth(100);
  }

  async createTrumpCard() {
    const texture = this.getCardTexture(this.trump);
    const trumpCard = new Card(this, 80, config.height / 2, 'cards', texture, this.trump);
    await trumpCard.positionTrump();
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
  async startGame(status: TypeRoomStatus) {
    this.trump = useGameStore.getState().trumpCard;
    if (status === 'GameInProgress') {
      this.createTrumpSuit();
      await this.createTrumpCard();
      await this.createCardSprites(useGameStore.getState().dealt, 1);
      this.createCardsText();
      //иначе, если до игры он же был активный, то не меняется
      this.colorIcon(useGameStore.getState().activeSocketId);
    }
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
    const deck = useGameStore.getState().deckCounter;
    if (deck < 8) {
      while (this.deckCards.length > deck) {
        this.deckCards[0].destroy();
      }
    }
    const text = deck <= 1 ? '' : deck.toString();
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
