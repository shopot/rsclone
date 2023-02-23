import PageRouting from '../pages';
import { withProviders } from './providers';
import './index.scss';

const App = () => {
  return <PageRouting />;
};

export default withProviders(App);
