import React from 'react';
import { Route, Routes } from 'react-router';
import NotFound from './404';
import AboutPage from './about';
import GamePage from './game';
import HistoryPage from './history';
import HomePage from './home';
import RatingPage from './rating';
import { Layout } from '../components/Layout';

const PageRouting = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          index
          element={<HomePage />}
        />
        <Route
          path="/about"
          element={<AboutPage />}
        />
        <Route
          path="/history"
          element={<HistoryPage />}
        />
        <Route
          path="/rating"
          element={<RatingPage />}
        />
      </Route>
      <Route
        path="/game/:roomId"
        element={<GamePage />}
      />
      <Route
        path="/*"
        element={<NotFound />}
      />
    </Routes>
  );
};

export default PageRouting;
