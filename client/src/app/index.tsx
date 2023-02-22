import React from 'react';
import PageRouting from '../pages';
import { withProviders } from './providers';
import './index.scss';
import { useUser } from '../hooks';

const App = () => {
  const { user, isUserAuth, toggleAuth } = useUser();

  console.log(user, isUserAuth);

  return <PageRouting />;
};

export default withProviders(App);
