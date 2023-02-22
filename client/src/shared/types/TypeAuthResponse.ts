export type TypeAuthUser = {
  userId: number;
  username: string;
  avatar: string;
};

export type TypeAuthResponse = {
  statusCode: number;
  data: TypeAuthUser;
  message: 'ok' | 'created';
};
