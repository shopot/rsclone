import axios, { isAxiosError } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { HTTP_ENDPOINT } from '../../app/config/index';

export const enum ApiEndpoint {
  AuthSignup = 'auth/signup',
  AuthSignin = 'auth/signin',
  AuthLogout = 'auth/logout',
  AuthRefresh = 'auth/refresh',
  AuthWhoAmI = 'auth/whoami',
  History = 'history',
  Rating = 'rating',
  UploadAvatar = 'user/upload',
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
  async fetch<T>(
    method: HTTPRequestMethod,
    endpoint: ApiEndpoint,
    data: RequestDto = {},
    formData?: FormData,
  ): Promise<IResponseObject<T>> {
    switch (method) {
      case HTTPRequestMethod.POST: {
        try {
          const res = formData
            ? await instance.post(endpoint, formData)
            : await instance.post(endpoint, { ...data });

          return {
            status: res.status,
            statusText: res.statusText,
            data: <T>res.data,
          };
        } catch (error) {
          return this.getResponseError<T>(error);
        }
      }
      case HTTPRequestMethod.GET: {
        try {
          const res = await instance.get(endpoint);

          return {
            status: res.status,
            statusText: res.statusText,
            data: <T>res.data,
          };
        } catch (error) {
          return this.getResponseError<T>(error);
        }
      }
    }
  },

  getResponseError<TT>(error: unknown) {
    if (isAxiosError(error)) {
      const { response } = error;

      if (
        typeof response?.status === 'number' &&
        response?.status >= 400 &&
        response?.status < 500
      ) {
        return {
          status: response.status,
          statusText: response?.statusText || 'An unexpected error occurred',
          data: <TT>response?.data,
        };
      }

      return {
        status: error.status || 400,
        statusText: error.message,
      };
    }

    return {
      status: 400,
      statusText: 'An unexpected error occurred',
    };
  },
};

export interface IResponseObject<T> {
  status: number;
  statusText: string;
  data?: T;
}
