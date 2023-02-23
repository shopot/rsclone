import React, { useEffect } from 'react';
import PageRouting from '../pages';
import { useUserStore } from '../store/userStore';
import { withProviders } from './providers';
import './index.scss';
// import { useUser } from '../hooks';

const App = () => {
  // const { user, isUserAuth, toggleAuth } = useUser();
  const { actions } = useUserStore();
  useEffect(() => {
    void actions.setUser();
  }, [actions]);

  // console.log(user, isUserAuth);

  return <PageRouting />;
};

export default withProviders(App);
