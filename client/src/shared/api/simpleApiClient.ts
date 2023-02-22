import axios, { isAxiosError } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { HTTP_ENDPOINT } from '../../app/config/index';

export const enum ApiEndpoint {
  AuthSignup = 'auth/signup',
  AuthSignin = 'auth/signin',
  AuthLogout = 'auth/logout',
  AuthRefresh = 'auth/refresh',
  History = 'history',
  Rating = 'rating',
}

export const enum HTTPRequestMethod {
  POST = 'POST',
  GET = 'GET',
}

export interface RequestDto {
  username?: string;
  password?: string;
}

const axiosOptions = {
  baseURL: HTTP_ENDPOINT,
  withCredentials: true,
  headers: { Accept: 'application/json' },
};

const instance = axios.create(axiosOptions);

createAuthRefreshInterceptor(instance, async () => {
  await axios({
    ...axiosOptions,
    url: `/${ApiEndpoint.AuthRefresh}`,
    responseType: 'json',
  });
});

export const simpleApiClient = {
  async fetch<T>(method: HTTPRequestMethod, endpoint: ApiEndpoint, data: RequestDto = {}) {
    switch (method) {
      case HTTPRequestMethod.POST: {
        try {
          const res = await instance.post<T>(endpoint, { ...data });
          return res;
        } catch (error) {
          return this.getResponseError(error);
        }
      }
      case HTTPRequestMethod.GET: {
        try {
          const res = await instance.get<T>(endpoint);

          return res;
        } catch (error) {
          return this.getResponseError(error);
        }
      }
    }
  },

  getResponseError(error: unknown) {
    if (isAxiosError(error)) {
      return {
        statusCode: error.status,
        message: error.message,
      };
    }

    return {
      statusCode: 400,
      message: 'An unexpected error occurred',
    };
  },
};
