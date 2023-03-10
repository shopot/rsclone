import Phaser from 'phaser';
import { config } from '../index';
import { Hand } from '../prefabs/Hand';
import { CardsText } from '../prefabs/CardsText';
import { Card } from '../prefabs/Card';
import { Suit } from '../prefabs/Suit';
import { Button } from '../prefabs/Button';
import { socketIOService } from '../../../shared/api/socketio';
import { TypeGameState, useGameStore } from '../../../store/gameStore';
import { useChatStore } from '../../../store/chatStore';
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
import { WaitPopup } from '../classes/WaitPopup';

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
  waitPopup?: WaitPopup;
  animations = {
    take: false,
    pass: false,
    click: false,
    beforeGameOver: false,
    formDeck: false,
    shift: false,
    toCenter: false,
    tableResize: false,
  };
  spritesCalcs = {
    highlight: false,
    create: false,
    positions: false,
    sort: false,
    spliceFromPlayer: false,
  };

  constructor() {
    super('Game');

    useChatStore.subscribe((state) => this.updateChat(state.chat));

    useGameStore.subscribe(
      (state) => state.players.length,
      () => this.setPlayers(),
    );

    useGameStore.subscribe(
      (state) => state.players,
      (data) => this.sortPlayersData(data),
    );

    useGameStore.subscribe(
      (state) => state.roomStatus,
      (data) => void this.handleRoomStatus(data),
    );

    useGameStore.subscribe(
      (state) => state.activeSocketId,
      (data) => this.colorIcon(data),
    );

    useGameStore.subscribe(
      (state) => state,
      (state, prevState) => void this.handleActions(state, prevState),
    );

    useGameStore.subscribe(
      (state) => state.placedCards,
      (piles, prevPiles) => this.saveTableCards(piles, prevPiles),
    );
  }

  create() {
    this.createBg();
    this.createChat();
    this.setPlayers();
    this.createButtons();
    this.createDeck(36);
    this.createSounds();
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

  //???????????????? ???? ??????????????????
  async handleRoomStatus(roomStatus: TypeRoomStatus) {
    if (roomStatus === TypeRoomStatus.GameInProgress) {
      await this.restartGame();
    }
  }

  cleanOut() {
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
    this.trump = useGameStore.getState().trumpCard;
    await this.startGame();
  }

  endGame() {
    this.scene.start('End');
  }

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
    }
    await this.handleClick();
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
    const playerStatuses = this.playersSorted.map((player) => player.playerStatus);
    this.icons.forEach((icon, ind) => {
      if (playerStatuses[ind] === TypePlayerStatus.Offline) {
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
    //???????? ?????????? host ?????????? ???????????????? ????????
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
    this.deActivateSprites();
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
    this.animations.take = true;
    await Promise.all(
      this.piles.flat().map(async (card) => {
        card.setAngle(0);
        await card.animateToPlayer(defenderInd, this.playerAmt);
        this.playersCardsSprites[defenderInd].push(card);
      }),
    );
    this.animations.take = false;
    this.piles = [];
    await this.handleCardsAtHandsAfterMove();
    this.updatePlayersText();
  }

  activateSprites() {
    const mySprites = this.playersCardsSprites[0];
    if (mySprites && mySprites.length > 0) {
      setTimeout(() => {
        mySprites.forEach((sprite) => sprite.makeClickable());
      }, 300);
    }
  }

  deActivateSprites() {
    const sprites = this.playersCardsSprites.flat();
    if (sprites && sprites.length > 0) sprites.forEach((sprite) => sprite.makeNotClickable());
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
    this.animations.pass = true;
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
    this.animations.pass = false;
  }

  async handleClick() {
    const params = { isAttacker: false, cardToMoveValue: '', pileInd: -1, pileLength: 0 };
    params.isAttacker = this.state?.lastGameAction === TypeGameAction.AttackerMoveCard;
    params.pileInd = params.isAttacker ? this.piles.length : this.piles.length - 1;
    params.pileLength = params.isAttacker ? this.piles.length + 1 : this.piles.length;
    const prevActivePlayerID = this.prevState?.activeSocketId || '';
    const isMe = prevActivePlayerID === this.socketId;
    //???????? ???????? ?????????? ???? ?????????? ?? ?????????????? ???????????? (???? ????????, ???? ????????)
    const placedArr = useGameStore
      .getState()
      .placedCards.map((obj) => [obj.attacker, obj.defender])
      .flat()
      .filter(Boolean);
    if (this.state?.placedCards.length !== 0 && placedArr.length > this.piles.flat().length) {
      const cardToMoveType = params.isAttacker
        ? this.state?.lastOpenAttackerCard
        : this.state?.lastCloseDefenderCard;
      if (cardToMoveType) {
        params.cardToMoveValue = this.getCardTexture(cardToMoveType);
      }
    }

    //???????? ?????? ???????? ???? ??????????, ?? ?????? ?? ?????????? - 1 ?????? - ???????? (??????????????????, ??????????????, ?????????? ???????????????? ???? 6)
    else if (
      this.state?.placedCards.length === 0 &&
      this.state?.lastGameAction === TypeGameAction.DefenderTakesCards
    ) {
      params.isAttacker = true;
      const cardToMoveType = this.state?.lastOpenAttackerCard;
      if (cardToMoveType) {
        params.cardToMoveValue = this.getCardTexture(cardToMoveType);
      }
      params.pileInd = params.isAttacker ? this.piles.length : this.piles.length - 1;
      params.pileLength = params.isAttacker ? this.piles.length + 1 : this.piles.length;
    }

    //???????? ?????? ???????? ???? ??????????, ?? ?????? ?? ?????????? - 2 ?????? - ?????????? ?????? ??????????????????
    else if (
      this.state?.placedCards.length === 0 &&
      this.state?.lastGameAction === TypeGameAction.DefenderMoveCard
    ) {
      params.isAttacker = false;
      const cardToMoveType = this.state?.lastCloseDefenderCard;
      if (cardToMoveType) {
        params.cardToMoveValue = this.getCardTexture(cardToMoveType);
      }
    }

    this.spritesCalcs.spliceFromPlayer = true;
    const sprite = this.playersCardsSprites
      .flat()
      .find((card) => card.value === params.cardToMoveValue);

    if (sprite) {
      const player = this.playersCardsSprites.filter((arr) => arr.includes(sprite))[0];
      const playerInd = this.playersCardsSprites.indexOf(player);
      if (player && playerInd !== -1 && params.pileInd !== -1) {
        this.animations.click = true;
        await sprite.animateToTable(
          params.pileInd,
          params.isAttacker,
          params.pileLength,
          isMe,
          0.8,
        );
        this.animations.click = false;

        const spriteInd = player.indexOf(sprite);
        this.playersCardsSprites[playerInd].splice(spriteInd, 1);
        params.isAttacker
          ? this.piles.push([sprite])
          : this.piles[params.pileLength - 1].push(sprite);

        this.handleHighlight();
        await this.handleCardsAtHandsBeforeMove();
        this.updatePlayersText();
        await this.updateCardsPosOnTable();

        //?????????? ???????????????????????????? ???? ???????? ?? ????????, ???????? ????????
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
    this.spritesCalcs.spliceFromPlayer = false;
    // this.animations.click = false;
  }

  async handleActionsBeforeGameOver() {
    this.animations.beforeGameOver = true;
    this.removeHighlight();
    const isPickingUp = this.state?.lastGameAction === TypeGameAction.DefenderDecidesToPickUp;
    const didAttackerMove = this.state?.lastGameAction === TypeGameAction.AttackerMoveCard;

    if (isPickingUp || didAttackerMove) {
      let defenderInd = -1;
      if (didAttackerMove) {
        const loser = this.state?.players.find(
          (player) => player.playerStatus === TypePlayerStatus.YouLoser,
        );
        //???????? ?????????? ??????????, ???? loser undefined
        if (loser) {
          const defender = this.playersSorted.filter((el) => el.socketId === loser.socketId)[0];
          defenderInd = this.playersSorted.indexOf(defender);
        }
      } else {
        const lastDefender = this.prevState?.players.find(
          (player) => player.playerRole === TypePlayerRole.Defender,
        );
        if (lastDefender) {
          const defender = this.playersSorted.filter(
            (el) => el.socketId === lastDefender.socketId,
          )[0];
          defenderInd = this.playersSorted.indexOf(defender);
        }
      }

      if (defenderInd !== -1) {
        this.deActivateSprites();
        await Promise.all(
          this.piles.flat().map(async (card) => {
            card.setAngle(0);
            await card.animateToPlayer(defenderInd, this.playerAmt);
            this.playersCardsSprites[defenderInd].push(card);
          }),
        );

        this.piles = [];
        await this.handleCardsAtHandsBeforeMove();
        this.updatePlayersText();
      }
    }
    this.animations.beforeGameOver = false;
  }

  async checkGameOver() {
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

  handleHighlight() {
    this.spritesCalcs.highlight = true;
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
    this.spritesCalcs.highlight = false;
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
    this.mainButton = new Button(this);
    const players = useGameStore.getState().players;
    if (players.length > 0 && this.socketId !== players[0].socketId) {
      this.mainButton.setAlpha(0);
    } else if (players.length === 0) {
      this.scene.start('End');
    }
    new ButtonLeave(this);
  }

  setHelperToZero() {
    if (this.piles.length === 0 && this.state?.placedCards.length === 0) {
      setTimeout(() => {
        this.statusHelper?.setStatus('', '');
      }, 1000);
    }
  }

  removeInteractiveByClick() {
    const isAnyClicked = this.playersCardsSprites.flat().some((sprite) => sprite.clicked === true);
    if (isAnyClicked) {
      this.playersCardsSprites[0].forEach((sprite) => {
        sprite.makeNotClickable();
        sprite.clicked = false;
      });
    }
  }

  controlAnimations() {
    const allAnimationsDone = Object.values(this.animations).every((el) => el === false);
    const allCalcsDone = Object.values(this.spritesCalcs).every((el) => el === false);
    const amActive = useGameStore.getState().activeSocketId === this.socketId;
    if (allAnimationsDone && allCalcsDone && amActive) this.activateSprites();
    else this.deActivateSprites();
  }

  update() {
    this.setHelperToZero();
    this.removeInteractiveByClick();
    this.controlAnimations();
  }

  //???????????????? ???? [state.roomStatus, state.activeSocketId, round]
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

  //???????????????? ???? state.players.length
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
      this.createWaitTitle();
    }
  }

  createWaitTitle() {
    this.waitPopup?.destroy();
    const players = useGameStore.getState().players;
    if (players.length > 0) {
      const isHost = players[0].socketId === this.socketId;
      this.waitPopup = new WaitPopup(this, isHost, this.playerAmt);
    }
  }

  createHelper() {
    this.statusHelper = new StatusHelper(this);
  }

  //???????????????? ???? state.players
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
    if (this.icons.length !== 0) {
      this.icons.forEach((el) => el.destroyIcon());
      this.icons = [];
    }
    for (let i = 0; i < this.playersSorted.length; i++) {
      const nickname = this.playersSorted[i].playerName;
      const socketId = this.playersSorted[i].socketId;

      const addIcon = () => {
        const icon = new Icon(
          this,
          i,
          this.handSizes,
          nickname,
          socketId,
          this.playersSorted[i].playerAvatar,
        );
        this.icons.push(icon);
      };

      this.load.once('complete', addIcon, this);
      this.load.image(this.playersSorted[i].playerAvatar, this.playersSorted[i].playerAvatar);
      this.load.start();
    }
  }

  //???????????????? ???? state.activeSocketId
  colorIcon(activeId: string) {
    if (useGameStore.getState().roomStatus === TypeRoomStatus.GameInProgress) {
      this.icons.forEach((icon) => {
        icon.colorBorder(false);
        if (icon.border.timer) this.time.removeEvent(icon.border.timer);
      });
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
    this.waitPopup?.destroy();
    this.trump = useGameStore.getState().trumpCard;
    this.createTrumpSuit();
    this.createTimer();
    await this.createTrumpCard();
    await this.createCardSprites(useGameStore.getState().dealt, 1);
    this.createCardsText();
    //??????????, ???????? ???? ???????? ???? ???? ?????? ????????????????, ???? ???? ????????????????
    this.colorIcon(useGameStore.getState().activeSocketId);
  }

  createTimer() {
    this.timer = new Timer(this, this.handSizes[0]);
  }

  //???????????????? ???? state.dealt - ???????????? ???? ????????????????, ???????????????? ??????????????!!!!
  async checkDealt(dealt: TypeDealt[]) {
    const dealtCards = [...dealt].map((obj) => obj.cards).flat();
    const round = useGameStore.getState().currentRound;
    const isNew = JSON.stringify(this.prevDealt) !== JSON.stringify(dealt);
    if (dealtCards.length !== 0 && round > 1 && isNew) {
      this.deActivateSprites();
      await this.createCardSprites(dealt, round);
      this.prevDealt = dealt;
    }
  }

  async createCardSprites(dealt: TypeDealt[], round: number) {
    this.spritesCalcs.create = true;
    //= ???????????????? ?????????? ????????????????, ???????? ???????? ?????????????? ???? ????????????
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
    this.spritesCalcs.create = false;
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
    this.animations.formDeck = true;
    this.deActivateSprites();
    await this.handleCardsAtHandsBeforeMove();
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
    this.animations.formDeck = false;
  }

  calculatePositions() {
    this.spritesCalcs.positions = true;
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
    this.spritesCalcs.positions = false;
  }

  async shiftCardsAtHands() {
    this.animations.shift = true;
    this.deActivateSprites();
    await Promise.all(
      this.playersCardsSprites.map(async (set, i) => {
        await Promise.all(
          set.map(async (card, ind) => {
            await card.shiftOnHand(this.cardsCoords[i][ind]);
          }),
        );
      }),
    );
    this.animations.shift = false;
  }

  async handleCardsAtHandsBeforeMove() {
    this.calculatePositions();
    await this.shiftCardsAtHands();
  }

  async handleCardsAtHandsAfterMove() {
    this.sortCards();
    await this.moveCardsAtHandsToCenter();
    await this.shiftCardsAtHands();
  }

  async moveCardsAtHandsToCenter() {
    this.animations.toCenter = true;
    this.deActivateSprites();
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
    this.animations.toCenter = false;
  }

  sortCards() {
    this.spritesCalcs.sort = true;
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
    this.spritesCalcs.sort = false;
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
    this.animations.tableResize = true;
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
    this.animations.tableResize = false;
  }
}
