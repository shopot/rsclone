export type TypeAuthResponse = {
  statusCode: number;
  data: {
    userId: number;
    username: string;
    avatar: string;
  };
  message: 'ok' | 'created';
};
