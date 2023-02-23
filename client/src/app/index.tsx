import { useEffect } from 'react';
import PageRouting from '../pages';
import { useUserStore } from '../store/userStore';
import { withProviders } from './providers';
import './index.scss';

const App = () => {
  const { actions } = useUserStore();
  useEffect(() => {
    void actions.setUser();
  }, [actions]);

  return <PageRouting />;
};

export default withProviders(App);
