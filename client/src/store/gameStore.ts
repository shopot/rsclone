import {
  TypeCardSuit,
  TypeCardRank,
  TypePlayer,
  TypeSocketEvent,
  TypePlacedCard,
  TypeRoomStatus,
  TypeCard,
  TypeDealt,
  TypeServerError,
} from '../shared/types';
import { create } from 'zustand';
import { socketIOService } from '../shared/api/socketio';

type TypeGameState = {
  isOnline: boolean;
  roomId: string;
  roomStatus: TypeRoomStatus;
  hostSocketId: string;
  activeSocketId: string;
  players: TypePlayer[];
  trumpCard: TypeCard;
  placedCards: TypePlacedCard[];
  deckCounter: number;
  dealt: TypeDealt[];
  error: TypeServerError | '';
  isFirstAttackInRound: boolean;

  actions: {
    setGameState: () => void;
    startGame: () => void;
    makeAttackingMove: (card: TypeCard) => void;
  };
};

export const useGameStore = create<TypeGameState>((set, get) => {
  socketIOService.listen(TypeSocketEvent.Connect, () => {
    set({ isOnline: true });
  });

  socketIOService.listen(TypeSocketEvent.Disconnect, () => {
    set({ isOnline: false });
  });

  socketIOService.listen<{ data: TypeGameState }>(TypeSocketEvent.GameUpdateState, ({ data }) => {
    console.log(data);

    set({ ...data });
  });

  return {
    isOnline: false,
    roomId: '',
    roomStatus: TypeRoomStatus.WaitingForPlayers,
    hostSocketId: '',
    activeSocketId: '',
    players: [],
    trumpCard: {
      rank: TypeCardRank.RANK_6,
      suit: TypeCardSuit.Clubs,
    },
    placedCards: [],
    deckCounter: 0,
    dealt: [],
    error: '',
    get isFirstAttackInRound() {
      return get().placedCards.length === 0;
    },

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
      makeAttackingMove(card: TypeCard) {
        socketIOService.emit(TypeSocketEvent.GameCardOpen, { data: { card } });
      },
    },
  };
});
