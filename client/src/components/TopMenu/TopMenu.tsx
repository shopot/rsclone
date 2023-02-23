import styles from './TopMenu.m.scss';
import { NavLink, Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { TypeRoute } from '../../shared/types';

export const TopMenu = () => {
  const { user, actions } = useUserStore();

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
            to={TypeRoute.Rooms}
          >
            Rooms
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
        {user && (
          <li>
            <Link
              className={styles.navLink}
              onClick={() => {
                void actions.logout();
              }}
              to={TypeRoute.Home}
            >
              Logout
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};
