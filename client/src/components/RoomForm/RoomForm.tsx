import { useEffect, useState } from 'react';
import { IS_OLD_GAME_UI_ENABLED } from '../../app/config';
import styles from './RoomForm.m.scss';

export const RoomForm = ({ title, onSubmit, onCancel }: IRoomFormProps) => {
  const [playerName, setPlayerName] = useState('');
  const [oldGameUI, setOldGameUI] = useState(true);
  const [isPlayerNameValid, setIsPlayerNameValid] = useState(false);

  const actionText = title.toLowerCase().includes('join') ? 'Join' : 'Create';

  useEffect(() => {
    if (validateName(playerName)) {
      setIsPlayerNameValid(true);
    } else {
      setIsPlayerNameValid(false);
    }
  }, [playerName]);

  const validateName = (playerName: string) => {
    if (playerName.match(/^[a-zA-Z0-9а-яА-Я_\s]+$/) && playerName.length > 3) {
      return true;
    }

    return false;
  };

  const handleChangePlayerName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  };

  const handleSubmit = () => {
    if (validateName(playerName)) {
      onSubmit(playerName, oldGameUI);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.fromBody}>
        <h2 className="heading">{title}</h2>
        <label
          htmlFor="player-name"
          className={styles.playerName}
        >
          Your nickname:
          <input
            value={playerName}
            onChange={handleChangePlayerName}
            id="player-name"
            placeholder="Enter your Nickname"
            type="text"
          ></input>
        </label>
        {IS_OLD_GAME_UI_ENABLED && (
          <label className={styles.oldUI}>
            Old UI:
            <input
              type="checkbox"
              checked={oldGameUI}
              onChange={() => setOldGameUI(!oldGameUI)}
            />
          </label>
        )}
      </div>
      <div className={styles.formFooter}>
        <button
          onClick={handleSubmit}
          className="btn"
          type="button"
          disabled={!isPlayerNameValid}
        >
          {actionText}
        </button>
        <button
          onClick={onCancel}
          className="btn btn-secondary"
          type="button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export declare interface IRoomFormProps {
  title: string;
  onSubmit(playerName: string, oldGameUI: boolean): void;
  onCancel(): void;
}
