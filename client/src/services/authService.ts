import { storageService } from './storageService';
import { simpleApiClient, HTTPRequestMethod, ApiEndpoint } from '../shared/api';
import { validateAPIError, validateAuthResponse } from '../shared/validators';
import { TypeAuthResponse, TypeAPIError } from '../shared/types';
import { LOCALSTORAGE_AUTH_KEY } from '../shared/constants';

export const authService = {
  async login(username: string, password: string) {
    const response = await simpleApiClient.fetch<TypeAuthResponse>(
      HTTPRequestMethod.POST,
      ApiEndpoint.AuthSignin,
      {
        username,
        password,
      },
    );

    if (response.status === 200 && validateAuthResponse(response.data)) {
      return { data: response.data };
    } else if (validateAPIError(response)) {
      const error: TypeAPIError = response.data;
      return { error };
    } else {
      return { error: { statusCode: response.status, message: response.statusText } };
    }
  },

  async register(username: string, password: string) {
    const response = await simpleApiClient.fetch<TypeAuthResponse>(
      HTTPRequestMethod.POST,
      ApiEndpoint.AuthSignup,
      {
        username,
        password,
      },
    );

    if (response.status === 201 && validateAuthResponse(response.data)) {
      return { data: response.data };
    } else if (validateAPIError(response)) {
      const error: TypeAPIError = response.data;
      return { error };
    } else {
      return { error: { statusCode: response.status, message: response.statusText } };
    }
  },

  async whoami() {
    const response = await simpleApiClient.fetch<TypeAuthResponse>(
      HTTPRequestMethod.GET,
      ApiEndpoint.AuthWhoAmI,
    );

    if (response.status === 200 && validateAuthResponse(response.data)) {
      return response.data?.data || null;
    }

    return null;
  },

  async logout() {
    await simpleApiClient.fetch(HTTPRequestMethod.GET, ApiEndpoint.AuthLogout);
  },

  isAuth() {
    return storageService.has(LOCALSTORAGE_AUTH_KEY);
  },
};
