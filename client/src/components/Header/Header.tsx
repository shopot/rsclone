import { TopMenu } from '../TopMenu';
import styles from './Header.module.scss';

export const Header = () => {
  return (
    <header className={styles.header}>
      <TopMenu />
    </header>
  );
};
