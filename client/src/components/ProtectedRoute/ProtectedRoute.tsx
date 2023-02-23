import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { Spinner } from '../Spinner';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps): React.ReactElement => {
  const location = useLocation();
  const { user } = useUserStore();
  const [ready, setReady] = useState(false);
  const { actions } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      await actions.setUser();
    };

    fetchUser()
      .then(() => {
        setReady(true);
      })
      .catch((error) => console.error(error));
  }, [actions]);

  if (!user && !ready) {
    return <Spinner />;
  } else if (!user) {
    return (
      <Navigate
        to="/"
        replace={true}
        state={{ from: location }}
      />
    );
  }

  return children;
};
