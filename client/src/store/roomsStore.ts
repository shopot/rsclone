import { create } from 'zustand';
import { socketIOService } from '../shared/api/socketio';
import { TypeRoomDto } from '../shared/types';
import { TypeSocketEvent } from '../shared/types/TypeSocketEvent';

type TypeDataState = {
  rooms: TypeRoomDto[];
  isOnline: boolean;

  actions: {
    setRooms: () => void;
  };
};

export const useRoomsStore = create<TypeDataState>((set) => {
  socketIOService.listen(TypeSocketEvent.Connect, () => {
    set({ isOnline: true });
  });

  socketIOService.listen(TypeSocketEvent.Disconnect, () => {
    set({ isOnline: false });
  });

  socketIOService.listen<{ data: TypeRoomDto[] }>(TypeSocketEvent.GameRooms, ({ data }) => {
    set({ rooms: data });
  });

  return {
    rooms: [],
    isOnline: false,

    actions: {
      setRooms() {
        socketIOService.emit(TypeSocketEvent.GameRooms, { data: {} });
      },
    },
  };
});
