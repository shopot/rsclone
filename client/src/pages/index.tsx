import React from 'react';
import { Route, Routes } from 'react-router';
import NotFound from './404';
import AboutPage from './about';
import GamePage from './game';
import HistoryPage from './history';
import HomePage from './home';
import RatingPage from './rating';
import { Layout } from '../components/Layout';
import { TypeRoute } from '../shared/types';

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
          path={TypeRoute.About}
          element={<AboutPage />}
        />
        <Route
          path={TypeRoute.History}
          element={<HistoryPage />}
        />
        <Route
          path={TypeRoute.Rating}
          element={<RatingPage />}
        />
      </Route>
      <Route
        path={TypeRoute.Game}
        element={<GamePage />}
      />
      <Route
        path={TypeRoute.All}
        element={<NotFound />}
      />
    </Routes>
  );
};

export default PageRouting;
