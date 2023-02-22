import { TypeAuthUser } from './../shared/types/TypeAuthResponse';
import { authService } from './../services/authService';
import { useEffect, useState } from 'react';

export const useUser = () => {
  const [user, setUser] = useState<TypeAuthUser | null>(null);
  const [isUserAuth, setIsUserAuth] = useState(false);

  const changeUserAuth = async () => {
    const userAuth = await authService.whoami();

    if (userAuth !== null) {
      setUser(userAuth);
      setIsUserAuth(true);
    } else {
      setUser(null);
      setIsUserAuth(false);
    }
  };

  const toggleAuth = () => {
    void changeUserAuth();
  };

  useEffect(() => {
    void changeUserAuth();
  }, []);

  return { user, isUserAuth, toggleAuth };
};
