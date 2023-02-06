import {
  TypeCardSuit,
  TypeCardRank,
  TypePlayer,
  TypeSocketEvent,
  TypePlacedCard,
  TypeRoomStatus,
  TypeCard,
} from '../shared/types';
import { create } from 'zustand';
import { socketIOService } from '../shared/api/socketio';

type TypeGameState = {
  isOnline: boolean;
  roomStatus: TypeRoomStatus;
  hostPlayerId: string;
  players: TypePlayer[];
  activePlayer: string;
  trumpCard: TypeCard;
  placedCards: TypePlacedCard[];

  actions: {
    setGameState: () => void;
  };
};

export const useGameStore = create<TypeGameState>((set) => {
  socketIOService.listen(TypeSocketEvent.Connect, () => {
    set({ isOnline: true });
  });

  socketIOService.listen(TypeSocketEvent.Disconnect, () => {
    set({ isOnline: false });
  });

  socketIOService.listen<Partial<TypeGameState>>(TypeSocketEvent.GameUpdateState, (state) => {
    console.log(state);

    set({ ...state });
  });

  return {
    isOnline: false,
    roomStatus: TypeRoomStatus.WaitingForPlayers,
    hostPlayerId: '',
    players: [],
    activePlayer: '',
    trumpCard: {
      rank: TypeCardRank.RANK_6,
      suit: TypeCardSuit.Clubs,
    },
    placedCards: [],

    actions: {
      setGameState() {
        socketIOService.emit(TypeSocketEvent.GameUpdateState, { data: {} });
      },
    },
  };
});
