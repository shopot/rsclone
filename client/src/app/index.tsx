import React from 'react';
import { NavLink } from 'react-router-dom';
import PageRouting from '../pages';
import { withProviders } from './providers';
import './index.scss';
import styles from './app.m.scss';

const App = () => (
  // Potentially you can insert here
  // A single header for the entire application
  // Or do it on separate pages
  <>
    <div className="container">
      <header className={styles.header}>
        <nav>
          <ul className={styles.navList}>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
                to="/"
              >
                Home page
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
                to="about"
              >
                About page
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
                to="game"
              >
                Game page
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
                to="history"
              >
                History page
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
                to="rating"
              >
                Rating page
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
                to="nothing-here"
              >
                Nothing Here
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <PageRouting />
    </div>
  </>
);

export default withProviders(App);
