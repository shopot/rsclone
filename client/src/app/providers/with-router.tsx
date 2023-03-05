import React from 'react';
import { HashRouter } from 'react-router-dom';

export const withRouter = (component: () => React.ReactNode) => {
  const withBrowserRouter = () => <HashRouter>{component()}</HashRouter>;

  return withBrowserRouter;
};
