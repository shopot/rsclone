import React from 'react';
import PageRouting from '../pages';
import { withProviders } from './providers';
import './index.scss';

const App = () => <PageRouting />;

export default withProviders(App);
