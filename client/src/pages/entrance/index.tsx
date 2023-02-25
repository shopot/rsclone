import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MotionContainer } from '../../components/MotionContainer';
import { ModalContainer } from '../../components/ModalContainer';
import { LoginForm } from '../../components/LoginForm';
import { RegisterForm } from '../../components/RegisterForm';
import { useModal } from '../../hooks';
import { validateLocationState } from '../../shared/validators';
import cardsSet from '../../assets/cards-set.webp';
import durakLogoText from '../../assets/durak-logo-text.webp';
import durakLogoHat from '../../assets/durak-logo-hat.webp';
import styles from './styles.m.scss';
import { Footer } from '../../components/Footer';

const EntrancePage = () => {
  const locationState: unknown = useLocation().state;
  const refererPage = validateLocationState(locationState) ? locationState.from.pathname : null;
  const [formIdx, setFormIdx] = useState(0);
  const handleChangeForm = () => {
    setFormIdx((prev) => (prev + 1) % forms.length);
  };
  const forms = [
    <LoginForm
      key="loginform"
      refererPage={refererPage}
      onChangeForm={handleChangeForm}
    />,
    <RegisterForm
      key="registerform"
      refererPage={refererPage}
      onChangeForm={handleChangeForm}
    />,
  ];
  const [isOpen, toggle] = useModal(!!refererPage);

  return (
    <div className={styles.container}>
      <MotionContainer identKey="EntrancePage">
        <ModalContainer
          isOpen={isOpen}
          toggle={toggle}
        >
          {forms[formIdx]}
        </ModalContainer>
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
            <button
              className={styles.startButton}
              type="button"
              onClick={toggle}
            >
              Start
            </button>
          </div>
        </div>
        <div className={styles.footerWrapper}>
          <Footer />
        </div>
      </MotionContainer>
    </div>
  );
};

export default EntrancePage;
