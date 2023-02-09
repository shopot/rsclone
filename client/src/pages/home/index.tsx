import styles from './styles.m.scss';
import durakLogoPng from '../../assets/durak-logo-text.webp';

const HomePage = () => {
  return (
    <img
      className={styles.logoText}
      src={durakLogoPng}
      alt="DUSRAK Card Game"
    />
  );
};

export default HomePage;
