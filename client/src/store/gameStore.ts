import {
  TypeCardSuit,
  TypeCardRank,
  TypePlayer,
  TypeSocketEvent,
  TypePlacedCard,
  TypeRoomStatus,
  TypeCard,
  TypeDealt,
  TypeChatMessage,
  TypeGameAction,
  TypeServerError,
} from '../shared/types';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { socketIOService } from '../shared/api/socketio';
import { IS_DEVELOPMENT_MODE } from '../app/config';

export type TypeGameState = {
  isOnline: boolean;
  currentRound: number;
  roomId: string;
  roomStatus: TypeRoomStatus;
  hostSocketId: string;
  activeSocketId: string;
  players: TypePlayer[];
  chat: TypeChatMessage[];
  trumpCard: TypeCard;
  placedCards: TypePlacedCard[];
  deckCounter: number;
  dealt: TypeDealt[];
  lastGameAction: TypeGameAction;
  beatCardsArray?: Array<TypeCard[]>;
  beatCardsPlacedArray?: Array<TypePlacedCard[]>;
  lastOpenAttackerCard: TypeCard | null;
  lastCloseDefenderCard: TypeCard | null;
  error: TypeServerError | null;

  actions: {
    setGameState: () => void;
    startGame: () => void;
    leaveRoom: () => void;
    restartGame: () => void;
    openRoom: () => void;
    makeAttackingMove: (card: TypeCard) => void;
    makeDefensiveMove: (card: TypeCard) => void;
    attackerPass: () => void;
    defenderTake: () => void;
    sendMessage: (message: string) => void;
  };
};

export const useGameStore = create<TypeGameState>()(
  subscribeWithSelector((set, get) => {
    socketIOService.listen(TypeSocketEvent.Connect, () => {
      set({ isOnline: true });
    });

    socketIOService.listen(TypeSocketEvent.Disconnect, () => {
      set({ isOnline: false });
    });

    socketIOService.listen<{ data: TypeGameState }>(TypeSocketEvent.GameUpdateState, ({ data }) => {
      if (IS_DEVELOPMENT_MODE) {
        console.log(data);
      }

      set({ ...data, error: data.error ?? null });
    });

    return {
      isOnline: false,
      currentRound: 0,
      roomId: '',
      roomStatus: TypeRoomStatus.WaitingForPlayers,
      hostSocketId: '',
      activeSocketId: '',
      players: [],
      chat: [],
      trumpCard: {
        rank: TypeCardRank.RANK_6,
        suit: TypeCardSuit.Clubs,
      },
      placedCards: [],
      deckCounter: 0,
      dealt: [],
      lastGameAction: TypeGameAction.Undefined,
      beatCardsArray: [],
      beatCardsPlacedArray: [],
      lastOpenAttackerCard: null,
      lastCloseDefenderCard: null,
      error: null,

      getPlayerCards: (): TypeCard[] => {
        const socketId = socketIOService.getSocketId();
        const players = get().players;

        for (const player of players) {
          if (player.socketId === socketId) {
            return player.cards;
          }
        }

        return [];
      },

      actions: {
        setGameState() {
          socketIOService.emit(TypeSocketEvent.GameUpdateState, { data: {} });
        },

        startGame() {
          socketIOService.emit(TypeSocketEvent.GameStart, { data: {} });
        },

        leaveRoom() {
          socketIOService.emit(TypeSocketEvent.GameLeaveRoom, { data: {} });
        },

        restartGame() {
          socketIOService.emit(TypeSocketEvent.GameRestartGame, { data: {} });
        },

        openRoom() {
          socketIOService.emit(TypeSocketEvent.GameOpenRoom, { data: {} });
        },

        makeAttackingMove(card: TypeCard) {
          socketIOService.emit(TypeSocketEvent.GameCardOpen, { data: { card } });
        },

        makeDefensiveMove(card: TypeCard) {
          socketIOService.emit(TypeSocketEvent.GameCardClose, { data: { card } });
        },

        attackerPass() {
          socketIOService.emit(TypeSocketEvent.GameAttackerPass, { data: {} });
        },

        defenderTake() {
          socketIOService.emit(TypeSocketEvent.GamePickUpCards, { data: {} });
        },

        sendMessage(message: string) {
          socketIOService.emit(TypeSocketEvent.GameChatMessage, { data: { message } });
        },
      },
    };
  }),
);
