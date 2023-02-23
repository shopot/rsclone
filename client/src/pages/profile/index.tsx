import { useState } from 'react';
import { MotionContainer } from '../../components/MotionContainer';
import { avatars } from '../../shared/avatars';
import styles from './styles.m.scss';

const ProfilePage = () => {
  const [playerAvatarIdx, setPlayerAvatarIdx] = useState(0);
  const handleChooseAvatar = (idx: number) => {
    console.log(idx);
    setPlayerAvatarIdx(idx);
  };

  return (
    <div className="container">
      <MotionContainer identKey="ProfilePage">
        <div className="box-container">
          <h1 className="heading">User profile</h1>
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
        </div>
      </MotionContainer>
    </div>
  );
};

export default ProfilePage;
