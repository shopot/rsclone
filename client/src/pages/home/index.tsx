import styles from './styles.m.scss';
import durakLogoText from '../../assets/durak-logo-text.webp';
import durakLogoHat from '../../assets/durak-logo-hat.webp';
import cardsSet from '../../assets/cards-set.webp';
import { TypeRoute } from '../../shared/types';
import { Link } from 'react-router-dom';
import { MotionContainer } from '../../components/MotionContainer';

const HomePage = () => {
  return (
    <div className="container">
      <MotionContainer identKey="HomePage">
        <div className={styles.innerContainer}>
          <div className={styles.innerLogo}>
            <div>
              <img
                className={styles.cardsSet}
                width="658"
                height="544"
                src={cardsSet}
                alt="Cards"
              />
            </div>
            <div className={styles.logoWrapper}>
              <img
                className={styles.durakLogoHat}
                src={durakLogoHat}
                width="450"
                height="249"
                alt="DURAK Card Game"
              />
              <img
                className={styles.durakLogoText}
                src={durakLogoText}
                width="572"
                height="197"
                alt="DURAK Card Game"
              />
            </div>
          </div>
          <div className={styles.startWrapper}>
            <Link
              to={TypeRoute.Rooms}
              className={styles.startButton}
            >
              <span></span>
              <span></span>
              <span></span>
              <span></span> Start
            </Link>
          </div>
        </div>
      </MotionContainer>
    </div>
  );
};

export default HomePage;
