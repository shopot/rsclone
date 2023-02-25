import { UNIQUE_LOCALSTORAGE_PREFIX } from '../shared/constants';

const provider = window.localStorage;

export const storageService = {
  fullKey(key: string) {
    return `${UNIQUE_LOCALSTORAGE_PREFIX}-${key}`;
  },

  clear() {
    provider.clear();
  },

  get(key: string): unknown | null {
    const item = provider.getItem(this.fullKey(key));
    if (item === null) {
      return null;
    }

    return JSON.parse(item);
  },

  has(key: string): boolean {
    return !!this.get(key);
  },

  set(key: string, value: unknown) {
    provider.setItem(this.fullKey(key), JSON.stringify(value));
  },

  remove(key: string) {
    provider.removeItem(this.fullKey(key));
  },
};
