import { useState } from 'react';

export function useLocalStorage<T>(
  uniquePrefix: string,
  key: string,
  initialValue: T,
  validator: (value: unknown) => value is T,
  provider: Storage = window.localStorage,
): [T, (value: unknown) => void] {
  const [value, setStoredValue] = useState<T>(() => {
    const item = provider.getItem(`${uniquePrefix}-${key}`);

    if (!item) {
      return initialValue;
    }

    const result: unknown = JSON.parse(item);

    return validator(result) ? result : initialValue;
  });

  const setValue = (value: unknown) => {
    if (validator(value)) {
      setStoredValue(value);
      provider.setItem(`${uniquePrefix}-${key}`, JSON.stringify(value));
    }
  };

  return [value, setValue];
}
