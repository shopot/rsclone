import styles from './styles.m.scss';
import durakLogo from '../../assets/durak-logo-text.webp';

const HomePage = () => {
  return (
    <img
      className={styles.logoText}
      src={durakLogo}
      alt="DURAK Card Game"
    />
  );
};

export default HomePage;
