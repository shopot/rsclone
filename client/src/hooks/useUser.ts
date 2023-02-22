import { TypeAuthUser } from './../shared/types/TypeAuthResponse';
import { authService } from './../services/authService';
import { useEffect, useState } from 'react';

export const useUser = () => {
  const [user, setUser] = useState<TypeAuthUser | null>(null);
  const [isUserAuth, setIsUserAuth] = useState(false);

  const getUserDetails = async () => {
    const userAuth = await authService.whoami();

    if (userAuth !== null) {
      setUser(userAuth);
      setIsUserAuth(true);
    }
  };

  const setAuthenticated = () => {
    void getUserDetails();
  };

  useEffect(() => {
    void getUserDetails();
  }, []);

  return { user, isUserAuth, setAuthenticated };
};
