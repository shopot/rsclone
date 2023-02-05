import React, { useEffect } from 'react';
import PageRouting from '../pages';
import { withProviders } from './providers';
import './index.scss';
import { Header } from '../components/Header';
import { useLocation } from 'react-router-dom';

const App = () => {
  return (
    <>
      <Header />
      <PageRouting />
    </>
  );
};

export default withProviders(App);
