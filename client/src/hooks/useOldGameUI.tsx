import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IS_OLD_GAME_UI_ENABLED } from '../app/config';
import { TypeResponseObject } from '../shared/types';

export const useOldGameUI = (flag = IS_OLD_GAME_UI_ENABLED) => {
  const [isOldGameUI, setIsOldGameUI] = useState(flag);
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
