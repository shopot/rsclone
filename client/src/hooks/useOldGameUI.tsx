import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TypeResponseObject } from '../shared/types';

export const useOldGameUI = () => {
  const [isOldGameUI, setIsOldGameUI] = useState(true);
  const navigate = useNavigate();

  const setOldGameUI = (flag = true) => {
    setIsOldGameUI(flag);
  };

  const redirectToGamePage = ({ data }: TypeResponseObject) => {
    if (isOldGameUI) {
      navigate(`/gameold/${data.roomId}`);
    } else {
      navigate(`/game/${data.roomId}`);
    }

    console.log(data);
  };

  return [isOldGameUI, setOldGameUI, redirectToGamePage] as const;
};
