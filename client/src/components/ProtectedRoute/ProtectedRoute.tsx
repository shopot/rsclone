import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps): React.ReactElement => {
  const location = useLocation();
  const { user } = useUserStore();

  console.log('USER', user);

  if (!user) {
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
