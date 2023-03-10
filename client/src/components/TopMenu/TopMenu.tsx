import { NavLink, Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { PlayerInfo } from '../PlayerInfo';
import { TypeRoute } from '../../shared/types';
import styles from './TopMenu.m.scss';

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
            to={TypeRoute.Profile}
          >
            Profile
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
          <>
            <li>
              <Link
                className={styles.navLink}
                onClick={() => {
                  void actions.logout();
                }}
                to={TypeRoute.Entrance}
              >
                Logout
              </Link>
            </li>
            <li>
              <Link to={TypeRoute.Profile}>
                <PlayerInfo
                  playerName={user.username}
                  avatarURL={user.avatar}
                />
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};
