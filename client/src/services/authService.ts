import ky from 'ky';
import { JWTTokenValidator } from '../shared/validators/JWTTokenValidator';
import { HTTP_ENDPOINT } from '../app/config';

export const authService = {
  async login(username: string, password: string) {
    try {
      const json = await ky
        .post('auth/signin', { json: { username, password }, prefixUrl: HTTP_ENDPOINT })
        .json();
      return { data: json, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown fetch error' };
    }
  },

  async register(username: string, password: string) {
    try {
      const json = await ky
        .post('auth/signup', { json: { username, password }, prefixUrl: HTTP_ENDPOINT })
        .json();
      if (JWTTokenValidator(json)) {
        return { data: json, error: null };
      }
      return { data: null, error: 'Data validation error' };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown fetch error' };
    }
  },
};
