import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TypeRoute } from '../../shared/types';
import styles from './styles.m.scss';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate(TypeRoute.Rooms);
  };

  return (
    <div className={styles.container}>
      <div className={styles.textContents}>
        <h1 className={styles.heading404}>404</h1>
        <p className={styles.description}>page not found</p>
      </div>
      <button
        type="button"
        className="btn"
        onClick={handleGoHome}
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
