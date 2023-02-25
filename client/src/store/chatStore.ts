import { create } from 'zustand';
import { socketIOService } from '../shared/api/socketio';
import { TypeSocketEvent, TypeChatMessage } from '../shared/types';

type TypeDataState = {
  chat: TypeChatMessage[];
  actions: { sendMessage: (message: string) => void };
};

export const useChatStore = create<TypeDataState>((set) => {
  socketIOService.listen<{ data: TypeChatMessage[] }>(TypeSocketEvent.GameChatState, ({ data }) => {
    set({ chat: data });
  });

  return {
    chat: [],

    actions: {
      sendMessage(message: string) {
        socketIOService.emit(TypeSocketEvent.GameChatMessage, { data: { message } });
      },
    },
  };
});
