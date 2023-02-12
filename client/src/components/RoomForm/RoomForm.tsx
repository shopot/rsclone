import { useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { IS_OLD_GAME_UI_ENABLED } from '../../app/config';
import { avatars, getPlayerAvatarIdx, validateAvatarIdx } from '../../shared/avatars';
import { AVATAR_PREFIX, UNIQUE_LOCALSTORAGE_PREFIX } from '../../shared/constants';
import styles from './RoomForm.m.scss';

type TypePlayerSettings = {
  playerName: string;
  avatar: string;
};

export const RoomForm = ({ title, onSubmit, onCancel }: IRoomFormProps) => {
  const validateName = (playerName: string) => {
    if (playerName.match(/^[a-zA-Z0-9а-яА-Я_\s]+$/) && playerName.length > 3) {
      return true;
    }

    return false;
  };

  const isPlayerSettings = (value: unknown): value is TypePlayerSettings => {
    if (
      value &&
      typeof value === 'object' &&
      'playerName' in value &&
      typeof value.playerName === 'string' &&
      validateName(value.playerName) &&
      'avatar' in value &&
      typeof value.avatar === 'string' &&
      validateAvatarIdx(getPlayerAvatarIdx(value.avatar))
    ) {
      return true;
    }

    return false;
  };

  const initialPlayerSettings: TypePlayerSettings = {
    playerName: '',
    avatar: `${AVATAR_PREFIX}0`,
  };

  const [playerSettings, setPlayerSettings] = useLocalStorage<TypePlayerSettings>(
    UNIQUE_LOCALSTORAGE_PREFIX,
    'playersettings',
    initialPlayerSettings,
    isPlayerSettings,
  );

  const [playerName, setPlayerName] = useState(playerSettings.playerName);
  const [oldGameUI, setOldGameUI] = useState(true);
  const [isPlayerNameValid, setIsPlayerNameValid] = useState(false);
  const [playerAvatarIdx, setPlayerAvatarIdx] = useState(getPlayerAvatarIdx(playerSettings.avatar));

  const actionText = title.toLowerCase().includes('join') ? 'Join' : 'Create';

  useEffect(() => {
    if (validateName(playerName)) {
      setIsPlayerNameValid(true);
    } else {
      setIsPlayerNameValid(false);
    }
  }, [playerName]);

  const handleChangePlayerName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  };

  const handleChooseAvatar = (idx: number) => {
    setPlayerAvatarIdx(idx);
  };

  const handleSubmit = () => {
    if (validateName(playerName) && validateAvatarIdx(playerAvatarIdx)) {
      setPlayerSettings({
        playerName,
        avatar: `${AVATAR_PREFIX}${playerAvatarIdx}`,
      });
      onSubmit(playerName, `${AVATAR_PREFIX}${playerAvatarIdx}`, oldGameUI);
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
        <div className={styles.avatars}>
          {avatars.map((avatar, idx) => (
            <button
              key={idx}
              className={`${styles.avatar} ${idx === playerAvatarIdx ? styles.avatarChosen : ''}`}
              type="button"
              role="radio"
              aria-checked={idx === playerAvatarIdx}
              onClick={() => handleChooseAvatar(idx)}
            >
              <img
                src={avatar}
                alt={`player avatar #${idx}`}
              />
            </button>
          ))}
        </div>
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
  onSubmit(playerName: string, playerAvatar: string, oldGameUI: boolean): void;
  onCancel(): void;
}
