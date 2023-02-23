import { Route, Routes } from 'react-router';
import { ProtectedRoute } from '../components/ProtectedRoute/ProtectedRoute';
import NotFound from './404';
import AboutPage from './about';
import GamePage from './game';
import GamePageOld from './gameold';
import HistoryPage from './history';
import HomePage from './home';
import RatingPage from './rating';
import ProfilePage from './profile';
import { Layout } from '../components/Layout';
import { TypeRoute } from '../shared/types';
import RoomPage from './rooms';

const PageRouting = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path={TypeRoute.Home}
          element={<HomePage />}
        />
        <Route
          index
          element={<HomePage />}
        />
        <Route
          path={TypeRoute.Rooms}
          element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={TypeRoute.About}
          element={
            <ProtectedRoute>
              <AboutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={TypeRoute.History}
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={TypeRoute.Rating}
          element={
            <ProtectedRoute>
              <RatingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={TypeRoute.Profile}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path={TypeRoute.Game}
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={TypeRoute.GameOld}
        element={
          <ProtectedRoute>
            <GamePageOld />
          </ProtectedRoute>
        }
      />
      <Route
        path={TypeRoute.All}
        element={<NotFound />}
      />
    </Routes>
  );
};

export default PageRouting;
