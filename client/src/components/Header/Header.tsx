import { TopMenu } from '../TopMenu';
import styles from './Header.m.scss';

export const Header = () => {
  return (
    <header className={styles.header}>
      <TopMenu />
    </header>
  );
};
