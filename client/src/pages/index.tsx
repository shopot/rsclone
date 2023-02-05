import React from 'react';
import { Route, Routes } from 'react-router';
import NotFound from './404';
import AboutPage from './about';
import GamePage from './game';
import HistoryPage from './history';
import HomePage from './home';
import RatingPage from './rating';

const PageRouting = () => {
  return (
    <Routes>
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
        path="/game/:roomId"
        element={<GamePage />}
      />
      <Route
        path="/history"
        element={<HistoryPage />}
      />
      <Route
        path="/rating"
        element={<RatingPage />}
      />
      <Route
        path="/*"
        element={<NotFound />}
      />
    </Routes>
  );
};

export default PageRouting;
