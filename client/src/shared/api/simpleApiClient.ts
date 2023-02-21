import axios, { isAxiosError } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { ValidateFunction } from 'ajv';
import { APIErrorValidator } from '../validators/APIErrorValidator';
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

const instance = axios.create({
  baseURL: HTTP_ENDPOINT,
  withCredentials: true,
});

const refreshAuthLogic = async () => {
  await axios.get(ApiEndpoint.AuthRefresh, { baseURL: HTTP_ENDPOINT, withCredentials: true });
};

createAuthRefreshInterceptor(instance, refreshAuthLogic);

export const simpleApiClient = {
  async fetch<T, U>(
    method: HTTPRequestMethod,
    endpoint: ApiEndpoint,
    dataValidator: ValidateFunction<U>,
    data: RequestDto = {},
  ) {
    switch (method) {
      case HTTPRequestMethod.POST: {
        try {
          const response = await instance.post<T>(endpoint, { ...data });

          if (dataValidator(response.data)) {
            return { data: response.data, error: null };
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
            error: error instanceof Error ? error.message : `Unknown ${method} error`,
          };
        }
      }
      case HTTPRequestMethod.GET: {
        try {
          const response = await instance.get<T>(endpoint);

          console.log(response);
          if (dataValidator(response.data)) {
            return { data: response.data, error: null };
          }
          return { data: null, error: 'Data validation error' };
        } catch (error) {
          console.log('ERROR', error);
          if (isAxiosError(error) && error.response && APIErrorValidator(error.response.data)) {
            return {
              data: null,
              error: `${error.response.data.statusCode} ${error.response.data.error}: ${error.response.data.message}`,
            };
          }
          return {
            data: null,
            error: error instanceof Error ? error.message : `Unknown ${method} error`,
          };
        }
      }
    }
  },
};
