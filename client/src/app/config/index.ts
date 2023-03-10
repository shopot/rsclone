const API_VERSION = 'v1';
export const IS_DEVELOPMENT_MODE = process.env.NODE_ENV === 'development';
export const APP_BACKEND_API_URL_DEFAULT = 'http://localhost:3000';
export const SOCKET_IO_ENDPOINT = process.env.APP_BACKEND_API_URL || APP_BACKEND_API_URL_DEFAULT;
export const HTTP_ENDPOINT = `${
  process.env.APP_BACKEND_API_URL || APP_BACKEND_API_URL_DEFAULT
}/${API_VERSION}`;
export const IS_OLD_GAME_UI_ENABLED = IS_DEVELOPMENT_MODE;
