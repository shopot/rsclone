export type TypeLoginRegisterMessage = {
  data: {
    userId: number;
    username: string;
    avatar: string;
  };
  message: 'ok' | 'created';
};
