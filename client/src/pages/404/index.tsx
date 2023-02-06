import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TypeRoute } from '../../shared/types';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate(TypeRoute.Home);
  };

  return (
    <div className="container">
      <h1 className="heading">404 Page not found.</h1>
      <div className="text-center">
        <button
          type="button"
          className="btn"
          onClick={handleGoHome}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
