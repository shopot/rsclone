import React from 'react';
import styles from './TopMenu.m.scss';
import { NavLink, useParams } from 'react-router-dom';
import { TypeRoute } from '../../shared/types';

export const TopMenu = () => {
  const params = useParams();

  console.log(params);

  return (
    <nav>
      <ul className={styles.navList}>
        <li>
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
            to={TypeRoute.Home}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
            to={TypeRoute.Rating}
          >
            Rating
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
            to={TypeRoute.History}
          >
            History
          </NavLink>
        </li>
        <li>
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
            to={TypeRoute.About}
          >
            About
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};
