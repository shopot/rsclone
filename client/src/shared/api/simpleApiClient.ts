import { HTTP_ENDPOINT } from '../../app/config/index';
import axios from 'axios';

export const enum ApiEndpoint {
  AuthSignup = 'auth/signup',
  AuthSignin = 'auth/signup',
  AuthLogout = 'auth/logout',
  AuthRefresh = 'auth/refresh',
}

export const enum HTTPRequestMethod {
  POST = 'POST',
  GET = 'GET',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}

export interface RequestDto {
  username?: string;
  password?: string;
}

const instance = axios.create({
  baseURL: HTTP_ENDPOINT,
  withCredentials: true,
});

export const simpleApiClient = {
  async fetch(method: HTTPRequestMethod, endpoint: ApiEndpoint, data: RequestDto = {}) {
    switch (method) {
      case HTTPRequestMethod.POST: {
        const res = await instance.post(endpoint, { ...data });
        return res;
      }
      case HTTPRequestMethod.GET: {
        const res = await instance.get(endpoint);
        return res;
      }
    }
  },
};
