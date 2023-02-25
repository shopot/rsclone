import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import PageRouting from '../pages';
import { withProviders } from './providers';
import './index.scss';

const App = () => {
  const { actions } = useUserStore();

  useEffect(() => {
    actions.setUser().catch((error) => console.error(error));
  }, [actions]);

  return <PageRouting />;
};

export default withProviders(App);
