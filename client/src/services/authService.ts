import axios, { isAxiosError } from 'axios';
import { JWTTokenValidator } from '../shared/validators/JWTTokenValidator';
import { APIErrorValidator } from '../shared/validators/APIErrorValidator';
import { HTTP_ENDPOINT } from '../app/config';

export const authService = {
  async login(username: string, password: string) {
    try {
      const json = await axios.post(
        'auth/signin',
        { username, password },
        { baseURL: HTTP_ENDPOINT },
      );
      if (JWTTokenValidator(json)) {
        return { data: json, error: null };
      }
      return { data: null, error: 'Data validation error' };
    } catch (error) {
      if (isAxiosError(error) && error.response && APIErrorValidator(error.response.data)) {
        return {
          data: null,
          error: `${error.response.data.statusCode} ${error.response.data.error}: ${error.response.data.message}`,
        };
      }
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown authService login POST error',
      };
    }
  },

  async register(username: string, password: string) {
    try {
      const json = await axios.post(
        'auth/signup',
        { username, password },
        { baseURL: HTTP_ENDPOINT },
      );
      if (JWTTokenValidator(json)) {
        return { data: json, error: null };
      }
      return { data: null, error: 'Data validation error' };
    } catch (error) {
      if (isAxiosError(error) && error.response && APIErrorValidator(error.response.data)) {
        return {
          data: null,
          error: `${error.response.data.statusCode} ${error.response.data.error}: ${error.response.data.message}`,
        };
      }
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown authService login POST error',
      };
    }
  },
};
