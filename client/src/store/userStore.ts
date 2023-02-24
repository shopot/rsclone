import { create } from 'zustand';
import { authService } from '../services/authService';
import { storageService } from '../services';
import { TypeAuthUser } from './../shared/types/TypeAuthResponse';
import { LOCALSTORAGE_AUTH_KEY } from '../shared/constants';

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
        if (result) {
          storageService.set(LOCALSTORAGE_AUTH_KEY, 'yes');
        } else {
          storageService.remove(LOCALSTORAGE_AUTH_KEY);
        }
        set({ user: result });
      },

      async logout() {
        await authService.logout();
        storageService.remove(LOCALSTORAGE_AUTH_KEY);
        set({ user: null });
      },
    },
  };
});
