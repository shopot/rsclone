import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps): React.ReactElement => {
  const location = useLocation();

  if (!authService.isAuth()) {
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
