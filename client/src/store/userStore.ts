import { create } from 'zustand';
import { authService } from '../services/authService';
import { TypeAuthUser } from './../shared/types/TypeAuthResponse';

type TypeUserState = {
  user: TypeAuthUser | null;

  actions: {
    setUser: () => Promise<void>;
    logout: () => Promise<void>;
  };
};

export const useUserStore = create<TypeUserState>((set) => {
  return {
    user: null,

    actions: {
      async setUser() {
        const result = await authService.whoami();
        set({ user: result });
      },

      async logout() {
        await authService.logout();
        set({ user: null });
      },
    },
  };
});
