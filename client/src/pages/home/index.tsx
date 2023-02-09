import styles from './styles.m.scss';
import durakLogoText from '../../assets/durak-logo-text.webp';
import durakLogoHat from '../../assets/durak-logo-hat.webp';
import cardsSet from '../../assets/cards-set.webp';
import { TypeRoute } from '../../shared/types';

const HomePage = () => {
  return (
    <div className="container">
      <div className={styles.innerContainer}>
        <div className={styles.innerLogo}>
          <div>
            <img
              className={styles.cardsSet}
              src={cardsSet}
              alt="Cards"
            />
          </div>
          <div className={styles.logoWrapper}>
            <img
              className={styles.durakLogoHat}
              src={durakLogoHat}
              alt="DURAK Card Game"
            />
            <img
              className={styles.durakLogoText}
              src={durakLogoText}
              alt="DURAK Card Game"
            />
          </div>
        </div>
        <div className={styles.startWrapper}>
          <a
            className={styles.startButton}
            href={TypeRoute.Rooms}
          >
            <span></span>
            <span></span>
            <span></span>
            <span></span> Start
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
