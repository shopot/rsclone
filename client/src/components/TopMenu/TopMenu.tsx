import { NavLink, Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { authService } from '../../services';
import { TypeRoute } from '../../shared/types';
import styles from './TopMenu.m.scss';

export const TopMenu = () => {
  const { actions } = useUserStore();

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
        {authService.isAuth() && (
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
