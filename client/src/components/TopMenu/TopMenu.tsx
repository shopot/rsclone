import styles from './TopMenu.module.scss';
import { NavLink, useParams } from 'react-router-dom';

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
  );
};
