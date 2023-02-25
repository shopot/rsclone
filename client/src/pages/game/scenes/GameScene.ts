import Phaser from 'phaser';
import { config } from '../index';
import { Hand } from '../prefabs/Hand';
import { CardsText } from '../prefabs/CardsText';
import { Card } from '../prefabs/Card';
import { Suit } from '../prefabs/Suit';
import { Button } from '../prefabs/Button';
import { socketIOService } from '../../../shared/api/socketio';
import { TypeGameState, useGameStore } from '../../../store/gameStore';
import { TypeDataState, useChatStore } from '../../../store/chatStore';
import {
  TypeCard,
  TypeChatMessage,
  TypeDealt,
  TypeGameAction,
  TypePlacedCard,
  TypePlayer,
  TypePlayerRole,
  TypePlayerStatus,
  TypeRoomStatus,
} from '../../../shared/types';
import { Icon } from '../classes/Icon';
import { ButtonLeave } from '../prefabs/ButtonLeave';
import { StatusHelper } from '../prefabs/StatusHelper';
import { Timer } from '../prefabs/Timer';
import { Chat } from '../classes/Chat';
import { Popup } from '../classes/Popup';
import { DataType } from 'ajv/dist/compile/validate/dataType';

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
        toBeaten: Phaser.Sound.BaseSound;
        newPlayer: Phaser.Sound.BaseSound;
        playerLeft: Phaser.Sound.BaseSound;
        fromDeck: Phaser.Sound.BaseSound;
      }
    | undefined;
  prevState: TypeGameState | undefined;
  state: TypeGameState | undefined;
  statusHelper: StatusHelper | undefined;
  timer: Timer | undefined;
  chat: Chat | undefined;
  popupOnOver = false;
  beaten: Card[] = [];
  popups: Popup[] = [];
  suit?: Suit;
  cardsCoords: number[][][] = [];
  cardsChanged: boolean[] = [];

  constructor() {
    super('Game');

    useChatStore.subscribe((state) => this.updateChat(state.chat));

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
    this.createChat();
    this.setPlayers();
    this.createButtons();
    this.createDeck(36);
    this.createSounds();
    // const isFirst = useGameStore.getState().players[0].socketId === this.socketId;
    // new Popup(this, this.playersSorted, true, isFirst);
    // this.icons.forEach((icon, ind) => {
    //   icon.offline(ind);
    // })
  }

  createChat() {
    this.chat = new Chat(this);
    const chatData = useChatStore.getState().chat;
    if (chatData.length !== 0) this.updateChat(chatData, chatData.length);
  }

  updateChat(chatContent: TypeChatMessage[], amt?: number) {
    this.chat?.updateChat(chatContent);
    this.chat?.notify(amt);
  }

  createSounds() {
    this.sounds = {
      toBeaten: this.sound.add('toBeaten'),
      newPlayer: this.sound.add('newPlayer'),
      playerLeft: this.sound.add('playerLeft'),
      fromDeck: this.sound.add('fromDeck'),
    };
  }

  //подписка на румстатус
  async handleRoomStatus(roomStatus: TypeRoomStatus) {
    if (roomStatus === TypeRoomStatus.GameInProgress) {
      await this.restartGame();
    }
  }

  cleanOut() {
    // this.scene.start('Restart');
    console.log('``````````````clean before restart``````````````');
    this.popupOnOver = false;
    this.popups.forEach((el) => el.destroyPopup());
    this.deckCards.forEach((el) => el.destroy());
    this.deckCards = [];
    this.deckText?.destroy();
    this.createDeck(36);
    this.playersCardsSprites.flat().forEach((el) => el.destroy());
    this.playersCardsSprites = [];
    this.playersText.forEach((el) => el.setText(''));
    this.playersText = [];
    this.piles.flat().forEach((el) => el.destroy());
    this.piles = [];
    this.dealtSprites.flat().forEach((el) => el.destroy());
    this.dealtSprites = [];
    this.beaten.flat().forEach((el) => el.destroy());
    this.beaten = [];
    this.prevDealt = [];
    this.playersSortedPrev = [];
    this.trumpCard?.destroy();
    this.suit?.destroy();
    this.setPlayers();
  }

  async restartGame() {
    this.cleanOut();
    console.log('```````````````restartGame```````````````````');
    this.trump = useGameStore.getState().trumpCard;
    await this.startGame();
  }

  endGame() {
    this.scene.start('End');
    //сделать модалку
  }

  //подписка на статус целиком. если только на экшены, то они могут не меняться, если несколько игроков делают пасс
  async handleActions(state: TypeGameState, prevState: TypeGameState) {
    this.prevState = prevState;
    this.state = state;
    if (state.roomStatus === TypeRoomStatus.GameIsOver) {
      this.handleOfflinePlayerAfterGameOver(state.players, prevState.players);
    }
    if (
      (prevState.roomStatus === TypeRoomStatus.GameIsOver &&
        state.roomStatus === TypeRoomStatus.WaitingForStart) ||
      (prevState.roomStatus === TypeRoomStatus.GameIsOver &&
        state.roomStatus === TypeRoomStatus.WaitingForPlayers)
    ) {
      this.cleanOut();
    }
    if (
      state.roomStatus === TypeRoomStatus.GameInProgress ||
      state.roomStatus === TypeRoomStatus.GameIsOver
    )
      this.handleWinner(state, prevState);
    if (state.players.length != prevState.players.length) {
      this.onPlayerAmtSounds(state.players.length - prevState.players.length);
    }

    if (
      (state.roomStatus === TypeRoomStatus.GameInProgress ||
        state.roomStatus === TypeRoomStatus.GameIsOver) &&
      state.activeSocketId !== prevState.activeSocketId &&
      prevState.roomStatus === TypeRoomStatus.GameInProgress
    ) {
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
      await this.handleClick();
    }

    if (
      state.roomStatus === TypeRoomStatus.GameInProgress ||
      state.roomStatus === TypeRoomStatus.GameIsOver
    ) {
      if (
        JSON.stringify(state.lastCloseDefenderCard) ===
          JSON.stringify(prevState.lastCloseDefenderCard) &&
        JSON.stringify(state.lastOpenAttackerCard) ===
          JSON.stringify(prevState.lastOpenAttackerCard)
      ) {
        if (
          state.lastGameAction === TypeGameAction.AttackerPass &&
          state.placedCards.length === 0
        ) {
          await this.handlePass();
        } else if (state.lastGameAction === TypeGameAction.DefenderTakesCards) {
          await this.handleTake();
        }
        await this.checkDealt(state.dealt);
      }
    }

    this.colorNickname();
    this.handleOfflinePlayer();
    if (
      state.lastGameAction === TypeGameAction.AttackerPass ||
      state.lastGameAction === TypeGameAction.DefenderDecidesToPickUp ||
      state.placedCards.length === 0
    ) {
      this.handleHighlight();
    }
    await this.checkGameOver();
    if (
      state.roomStatus !== prevState.roomStatus ||
      state.activeSocketId !== prevState.activeSocketId ||
      state.currentRound !== prevState.currentRound ||
      state.players.length !== prevState.players.length
    )
      this.updateButton(state.roomStatus, state.activeSocketId);
  }

  onPlayerAmtSounds(difference: number) {
    if (difference > 0) this.sounds?.newPlayer.play();
    else this.sounds?.playerLeft.play();
  }

  colorNickname() {
    const playersRoles = this.playersSorted.map((player) => player.playerRole);
    this.icons.forEach((icon, ind) => {
      icon.colorCloud(playersRoles[ind]);
    });
  }

  handleOfflinePlayer() {
    console.log('```````handleOfflinePlayer````````````````');
    const playerStatuses = this.playersSorted.map((player) => player.playerStatus);
    console.log(playerStatuses, 'playerStatuses');
    this.icons.forEach((icon, ind) => {
      if (playerStatuses[ind] === TypePlayerStatus.Offline) {
        console.log(ind, 'ind');
        icon.offline(ind);
      }
    });
  }
  handleOfflinePlayerAfterGameOver(players: TypePlayer[], prevPlayers: TypePlayer[]) {
    const currPlayersIDs = players.map((el) => el.socketId);
    const prevPlayersIDs = prevPlayers.map((el) => el.socketId);
    if (currPlayersIDs !== prevPlayersIDs) {
      const playersLeftIds = prevPlayersIDs.filter((el) => !currPlayersIDs.includes(el));
      this.icons.forEach((icon, ind) => {
        if (playersLeftIds.includes(icon.socketId)) {
          icon.offline(ind);
        }
      });
    }
    //если вышел host после окнчания игры
    if (players.length !== prevPlayers.length) {
      const isFirst = players[0].socketId === this.socketId;
      const wasFirst = prevPlayers[0].socketId === this.socketId;
      if (isFirst && isFirst !== wasFirst) new Popup(this, [], true, isFirst);
    }
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
    this.removeHighlight();
    this.calculatePositions();

    const spriteValueFromPile = this.piles.flat()[0].value;

    let defenderInd = -1;
    this.playersCards.forEach((arr) => {
      arr.forEach((el) => {
        if (this.getCardTexture(el) === spriteValueFromPile) {
          defenderInd = this.playersCards.indexOf(arr);
        }
      });
    });

    await Promise.all(
      this.piles.flat().map(async (card) => {
        card.setAngle(0);
        await card.animateToPlayer(defenderInd, this.playerAmt);
        this.playersCardsSprites[defenderInd].push(card);
      }),
    );

    this.piles = [];
    await this.handleCardsAtHandsAfterMove();
    this.updatePlayersText();
  }

  createBubble(text: string) {
    const prevActiveIcon = this.icons.find(
      (icon) => icon.socketId === this.prevState?.activeSocketId,
    );
    if (prevActiveIcon !== undefined && this.state?.roomStatus !== TypeRoomStatus.GameIsOver) {
      const me = this.prevState?.activeSocketId === this.socketId;
      prevActiveIcon.createBubble(text, me);
    }
  }
  async handlePass() {
    console.log('````````````handle pass````````````````');
    this.removeHighlight();
    const angle = 180 / (this.piles.flat().length + 1);
    this.sounds?.toBeaten.play({ volume: 0.1, loop: true });
    for (const card of this.piles.flat()) {
      const ind = this.piles.flat().indexOf(card);
      await card.animateToBeaten(angle + ind * angle, ind);
      this.beaten.push(card);
    }
    this.sounds?.toBeaten.stop();
    this.piles = [];
  }

  async handleClick() {
    console.log('`````````handle click`````````````');
    const params = { isAttacker: false, cardToMoveValue: '', pileInd: -1, pileLength: 0 };

    params.isAttacker = this.state?.lastGameAction === TypeGameAction.AttackerMoveCard;
    console.log(params.isAttacker, 'params.isAttacker');
    params.pileInd = params.isAttacker ? this.piles.length : this.piles.length - 1;
    console.log(this.piles, 'this.piles');
    params.pileLength = params.isAttacker ? this.piles.length + 1 : this.piles.length;
    console.log(params.pileLength, 'params.pileLength');
    const prevActivePlayerID = this.prevState?.activeSocketId || '';
    console.log(prevActivePlayerID, 'prevActivePlayerID');
    const isMe = prevActivePlayerID === this.socketId;
    console.log(isMe, 'isMe');
    //если есть карты на столе в текущем стейте (не бито, не тейк)
    const placedArr = useGameStore
      .getState()
      .placedCards.map((obj) => [obj.attacker, obj.defender])
      .flat()
      .filter(Boolean);
    if (this.state?.placedCards.length !== 0 && placedArr.length > this.piles.flat().length) {
      console.log('normal');
      const cardToMoveType = params.isAttacker
        ? this.state?.lastOpenAttackerCard
        : this.state?.lastCloseDefenderCard;
      console.log(cardToMoveType, 'cardToMoveType');
      if (cardToMoveType) {
        params.cardToMoveValue = this.getCardTexture(cardToMoveType);
        console.log(params.cardToMoveValue, 'params.cardToMoveValue');
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
      .find((card) => card.value === params.cardToMoveValue);
    console.log(sprite, 'sprite');

    if (sprite) {
      await sprite.animateToTable(params.pileInd, params.isAttacker, params.pileLength, isMe, 0.8);
      console.log(sprite, 'sprite');

      const player = this.playersCardsSprites.filter((arr) => arr.includes(sprite))[0];
      console.log(player, 'player');

      const playerInd = this.playersCardsSprites.indexOf(player);
      console.log(playerInd, 'playerInd');

      const spriteInd = this.playersCardsSprites[playerInd].indexOf(sprite);
      console.log(spriteInd, 'spriteInd');

      this.playersCardsSprites[playerInd].splice(spriteInd, 1);
      params.isAttacker
        ? this.piles.push([sprite])
        : this.piles[params.pileLength - 1].push(sprite);
      this.handleHighlight();
      console.log(this.playersCardsSprites[playerInd], 'this.playersCardsSprites[playerInd]');
      this.handleCardsAtHandsBeforeMove();
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
      } else if (
        this.state?.lastGameAction === TypeGameAction.DefenderDecidesToPickUp &&
        this.state?.roomStatus === TypeRoomStatus.GameIsOver
      ) {
        await this.handleTake();
      }
      await this.checkGameOver();
    }
  }

  async handleActionsBeforeGameOver() {
    console.log('``````check lastGameAction: "DefenderDecidesToPickUp"  ````````````');
    console.log('``````check lastGameAction: "AttackerMoveCard"  ````````````');
    this.removeHighlight();
    const isPickingUp = this.state?.lastGameAction === TypeGameAction.DefenderDecidesToPickUp;
    console.log(isPickingUp, 'isPickingUp');
    const didAttackerMove = this.state?.lastGameAction === TypeGameAction.AttackerMoveCard;
    console.log(didAttackerMove, 'didAttackerMove');

    if (isPickingUp || didAttackerMove) {
      let defenderInd = -1;
      if (didAttackerMove) {
        const loser = this.state?.players.find(
          (player) => player.playerStatus === TypePlayerStatus.YouLoser,
        );
        console.log(loser, 'loser');
        //если игрок вышел, то loser undefined
        if (loser) {
          const defender = this.playersSorted.filter((el) => el.socketId === loser.socketId)[0];
          console.log(defender, 'defender');
          defenderInd = this.playersSorted.indexOf(defender);
        }
      } else {
        const lastDefender = this.prevState?.players.find(
          (player) => player.playerRole === TypePlayerRole.Defender,
        );
        console.log(lastDefender, 'lastDefender');
        if (lastDefender) {
          const defender = this.playersSorted.filter(
            (el) => el.socketId === lastDefender.socketId,
          )[0];
          console.log(defender, 'defender');
          defenderInd = this.playersSorted.indexOf(defender);
        }
      }
      console.log(defenderInd, 'defenderInd');

      if (defenderInd !== -1) {
        await Promise.all(
          this.piles.flat().map(async (card) => {
            card.setAngle(0);
            await card.animateToPlayer(defenderInd, this.playerAmt);
            this.playersCardsSprites[defenderInd].push(card);
          }),
        );

        this.piles = [];
        this.handleCardsAtHandsBeforeMove();
        this.updatePlayersText();
      }
    }
  }

  async checkGameOver() {
    console.log('``````checkGameOver````````````');
    if (this.state?.roomStatus === TypeRoomStatus.GameIsOver && this.popupOnOver === false) {
      await this.handleActionsBeforeGameOver();

      const isFirst = useGameStore.getState().players[0].socketId === this.socketId;
      this.removeHighlight();
      this.mainButton?.update(TypeButtonStatus.Pass, false);
      this.icons.forEach((icon) => icon.colorBorder(false));
      this.timer?.stopTimer();
      if (this.state?.players.length === this.prevState?.players.length) {
        setTimeout(() => {
          const popup = new Popup(this, this.playersSorted, true, isFirst);
          this.popups.push(popup);
          this.popupOnOver = true;
        }, 200);
      } else {
        const currPlayersId = this.state?.players.map((player) => player.socketId);
        const prevPlayersId = this.prevState?.players.map((player) => player.socketId);

        if (currPlayersId && prevPlayersId) {
          const playerLeftId = prevPlayersId.filter((el) => !currPlayersId.includes(el))[0];
          const playerLeft = this.prevState?.players.filter(
            (el) => el.socketId === playerLeftId,
          )[0];
          setTimeout(() => {
            const popup = new Popup(this, this.playersSorted, true, isFirst, playerLeft);
            this.popups.push(popup);
            this.popupOnOver = true;
          }, 200);
        }
      }
    }
  }

  handleWrongClick() {
    //определить, кто нажимал ранее и у него проигрывать звук неправильного клика
  }

  handleHighlight() {
    const imIActive = useGameStore.getState().activeSocketId === this.socketId;
    const tableSprites = this.piles.flat();
    const mySprites = this.playersCardsSprites[0];
    if (!imIActive) this.removeHighlight();
    else if (mySprites && imIActive && tableSprites.length !== 0 && mySprites.length !== 0) {
      tableSprites.forEach((card) => card.removeHighlight());
      this.createHighlight();
    } else if (mySprites && imIActive && tableSprites.length === 0 && mySprites.length !== 0) {
      this.playersCardsSprites[0].forEach((card) => card.removeHighlight());
    }
  }

  createHighlight() {
    const myCards = this.playersCardsSprites[0];
    const myTrumpCards = myCards.filter((el) => el.cardType?.suit === this.trump.suit);
    const me = useGameStore
      .getState()
      .players.filter((player) => player.socketId === this.socketId)[0];
    const isAttacker = me.playerRole === TypePlayerRole.Attacker;
    const isDefender = me.playerRole === TypePlayerRole.Defender;
    const target = this.piles.flat()[this.piles.flat().length - 1].cardType;
    if (isDefender) {
      if (target?.suit === this.trump.suit) {
        myTrumpCards.forEach((card) => {
          if (card.cardType && card.cardType?.rank > target.rank) {
            card.highlight();
          }
        });
      } else {
        myCards.forEach((card) => {
          if (
            target &&
            card.cardType &&
            card.cardType?.suit === target?.suit &&
            card.cardType?.rank > target?.rank
          ) {
            card.highlight();
          }
        });
        myTrumpCards.forEach((card) => card.highlight());
      }
    } else if (isAttacker) {
      const targetsRanks = this.piles.flat().map((card) => card.cardType?.rank);
      const goodToClick = myCards.filter((card) => targetsRanks.includes(card.cardType?.rank));
      goodToClick.forEach((card) => card.highlight());
    }
  }

  removeHighlight() {
    const mySprites = this.playersCardsSprites[0];
    if (mySprites && mySprites.length !== 0) mySprites.forEach((card) => card.removeHighlight());
    const tableSprites = this.piles.flat();
    if (tableSprites.length !== 0) tableSprites.forEach((card) => card.removeHighlight());
  }

  createBg() {
    const bg = this.add.sprite(config.width / 2, config.height / 2, 'bgDark');
    bg.depth = config.depth.bg;
  }

  createButtons() {
    console.log('```````````````createButtons`````````````');
    this.mainButton = new Button(this);
    if (this.socketId !== useGameStore.getState().players[0].socketId) {
      this.mainButton.setAlpha(0);
    }
    new ButtonLeave(this);
  }

  update() {
    if (this.piles.length === 0 && this.state?.placedCards.length === 0) {
      setTimeout(() => {
        this.statusHelper?.setStatus('', '');
      }, 1000);
    }
  }

  //подписка на [state.roomStatus, state.activeSocketId, round]
  updateButton(roomStatus: string, activeSocketId: string) {
    if (this.mainButton !== undefined) {
      const isFirst = useGameStore.getState().players[0].socketId === this.socketId;
      if (isFirst && roomStatus === TypeRoomStatus.WaitingForStart) {
        this.mainButton?.setFrame('btn-start-disabled');
        this.mainButton?.setAlpha(1);
        setTimeout(() => {
          this.mainButton?.animateBeforeStart();
        }, 1000);
      } else if (isFirst && roomStatus === TypeRoomStatus.WaitingForPlayers) {
        this.mainButton?.update(TypeButtonStatus.Start, false);
      }

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
      else if (isSocketActive && isAttacker && !isPileOnTable) {
        this.mainButton.update(TypeButtonStatus.Pass, false);
      }
    }
  }

  //подписка на state.players.length
  setPlayers() {
    const roomStatus = useGameStore.getState().roomStatus;
    if (
      roomStatus === TypeRoomStatus.WaitingForStart ||
      roomStatus === TypeRoomStatus.WaitingForPlayers ||
      roomStatus === TypeRoomStatus.GameInProgress
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
    }
    this.playersCards = this.playersSorted.map((set) => set.cards);
  }

  handleWinner(state: TypeGameState, prevState: TypeGameState) {
    const me = state.players.filter((player) => player.socketId === this.socketId)[0];
    const winnersIds = state.players
      .filter((player) => player.playerStatus === TypePlayerStatus.YouWinner)
      .map((el) => el.socketId);
    const prevWinnersIds = prevState.players
      .filter((player) => player.playerStatus === TypePlayerStatus.YouWinner)
      .map((el) => el.socketId);

    const isGameOver = state.roomStatus === TypeRoomStatus.GameIsOver;
    if (
      winnersIds &&
      winnersIds.includes(me.socketId) &&
      !prevWinnersIds.includes(me.socketId) &&
      !isGameOver
    ) {
      const popup = new Popup(this, this.playersSorted, false, false);
      this.popups.push(popup);
    }

    const loserId = state.players
      .filter((player) => player.playerStatus === TypePlayerStatus.YouLoser)
      .map((el) => el.socketId)[0];
    this.icons.forEach((icon, i) => {
      if (winnersIds.includes(icon.socketId) && !icon.hasHat) {
        icon.makeHat(i, true);
      } else if (icon.socketId === loserId && !icon.hasHat) icon.makeHat(i, false);
    });
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
      this.icons.forEach((el) => el.destroyIcon());
      this.icons = [];
    }
    for (let i = 0; i < this.playersSorted.length; i++) {
      const nickname = this.playersSorted[i].playerName;
      const socketId = this.playersSorted[i].socketId;

      const addIcon = () => {
        const icon = new Icon(this, i, this.handSizes, nickname, socketId, i.toString());
        this.icons.push(icon);
      };

      this.load.once('complete', addIcon, this);
      this.load.image(i.toString(), this.playersSorted[i].playerAvatar);
      this.load.start();
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
    this.suit = new Suit(this, this.trump.suit);
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
      });
      this.dealtSprites.push(arr);
    });
    await this.animateFromDeckToPlayers();
    this.dealtToPlayers(round);
    await this.handleCardsAtHandsAfterMove();
  }

  dealtToPlayers(round: number) {
    this.dealtSprites.forEach((set, ind) => {
      const arr: Card[] = [];
      set.forEach((el) => {
        arr.push(el);
        if (round > 1) this.playersCardsSprites[ind].push(el);
      });
      if (round <= 1) this.playersCardsSprites.push(arr);
    });
    this.dealtSprites = [];
  }

  async animateFromDeckToPlayers() {
    this.handleCardsAtHandsBeforeMove();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const positions: number[][][] = JSON.parse(JSON.stringify(this.cardsCoords));
    positions.forEach((arr, i) =>
      arr.splice(0, this.cardsCoords[i].length - this.dealtSprites[i].length),
    );

    this.sounds?.fromDeck.play({ volume: 0.8, loop: false });
    await Promise.all(
      this.dealtSprites.map(async (arr, i) => {
        for (const sprite of arr) {
          await sprite.animateToPlayer1(
            i,
            positions[i][arr.indexOf(sprite)][0],
            positions[i][arr.indexOf(sprite)][1],
          );
        }
      }),
    );
    this.sounds?.fromDeck.stop();

    this.updateDeck();
    this.updatePlayersText();
  }

  calculatePositions() {
    this.cardsCoords = [];
    const border = 8;
    const handSize = { ...this.handSizes[0] };
    const isOver = useGameStore.getState().roomStatus === TypeRoomStatus.GameIsOver;
    const playersCardsSorted = this.playersSorted.map((player) => player.cards);
    const playersSpritesSorted = this.playersCardsSprites.map((arr) =>
      arr.map((sprite) => sprite.cardType),
    );

    const array = isOver ? playersSpritesSorted : playersCardsSorted;

    array.forEach((set, i) => {
      handSize.startX = this.handSizes[i].startX;
      handSize.width = this.handSizes[i].width;
      const shift = (handSize.width - border * 2 - config.cardSize.w) / (set.length - 1);
      const y = i === 0 ? config.height - config.cardSize.h / 2 : 30; //partially visible

      const arr: number[][] = [];
      set.forEach((card, ind) => {
        let x = handSize.startX + config.cardSize.w / 2 + ind * shift + border;
        if (set.length === 1) x = handSize.startX + config.cardSize.w / 2 + border;
        arr.push([x, y, ind + 1]);
      });
      this.cardsCoords.push(arr);
    });
  }

  shiftCardsAtHands() {
    this.playersCardsSprites.forEach((set, i) => {
      set.forEach((card, ind) => {
        card.shiftOnHand(this.cardsCoords[i][ind]);
      });
    });
  }

  handleCardsAtHandsBeforeMove() {
    this.calculatePositions();
    this.shiftCardsAtHands();
  }

  async handleCardsAtHandsAfterMove() {
    this.sortCards();
    await this.moveCardsAtHandsToCenter();
    this.shiftCardsAtHands();
  }

  async moveCardsAtHandsToCenter() {
    await Promise.all(
      this.playersCardsSprites.map(async (set, i) => {
        if (this.cardsChanged[i] === true) {
          await Promise.all(
            set.map(async (card) => {
              await card.animateToPlayer(i, this.playersCardsSprites.length);
            }),
          );
        }
      }),
    );
  }

  sortCards() {
    this.cardsChanged = [];
    const newPlayersCardsSprites: Card[][] = [];
    this.playersCardsSprites.map((arr) => {
      const oldArr = [...arr];
      arr.sort((a, b) => {
        if (a.cardType && b.cardType && a.cardType.rank < b.cardType.rank) {
          return -1;
        } else if (a.cardType && b.cardType && a.cardType.rank > b.cardType.rank) {
          return 1;
        }
        return 0;
      });
      arr.sort((a, b) => {
        if (a.cardType && b.cardType && a.cardType.suit < b.cardType.suit) {
          return -1;
        } else if (a.cardType && b.cardType && a.cardType.suit > b.cardType.suit) {
          return 1;
        }
        return 0;
      });
      const trumpCards = arr.filter((card) => card.cardType?.suit === this.trump.suit);
      const notTrumpCards = arr.filter((card) => card.cardType?.suit !== this.trump.suit);
      const newArr = [...notTrumpCards, ...trumpCards];
      newPlayersCardsSprites.push(newArr);
      if (JSON.stringify(oldArr) === JSON.stringify(newArr)) this.cardsChanged.push(false);
      else this.cardsChanged.push(true);
    });
    this.playersCardsSprites = newPlayersCardsSprites;
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
      if (Array.isArray(cardsWithoutMainPlayer[i])) {
        const content =
          cardsWithoutMainPlayer[i].length <= 1 ? '' : cardsWithoutMainPlayer[i].length.toString();
        text.setText(content);
      }
    });
  }

  async updateCardsPosOnTable() {
    if (this.piles.length === 4) {
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
}
