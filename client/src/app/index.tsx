import React from 'react';
import { Link } from 'react-router-dom';
import PageRouting from '../pages';

import './index.scss';
import { withProviders } from './providers';

const App = () => (
  // Potentially you can insert here
  // A single header for the entire application
  // Or do it on separate pages
  <>
    <PageRouting />
    <div style={{ marginTop: '30px' }}>
      <nav>
        <ul>
          <li>
            <Link to="/">Home page</Link>
          </li>
          <li>
            <Link to="about">About page</Link>
          </li>
          <li>
            <Link to="game">Game page</Link>
          </li>
          <li>
            <Link to="history">History page</Link>
          </li>
          <li>
            <Link to="rating">Rating page</Link>
          </li>
          <li>
            <Link to="nothing-here">Nothing Here</Link>
          </li>
        </ul>
      </nav>
    </div>
  </>
);

export default withProviders(App);
