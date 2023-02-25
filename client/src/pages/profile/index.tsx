import { useState } from 'react';
import { MotionContainer } from '../../components/MotionContainer';
import Avatar from 'react-avatar-edit';
import { userService } from '../../services';
import { avatars } from '../../shared/avatars';
import { AVATAR_SIZE, MESSAGE_TIMEOUT } from '../../shared/constants';
import defaultAvatar from '../../assets/avatars/default-avatar.webp';
import styles from './styles.m.scss';

const ProfilePage = () => {
  const [playerAvatar, setPlayerAvatar] = useState(avatars[0]);
  const [imagePreview, setImagePreview] = useState<string>(defaultAvatar);
  const [resetKey, setResetKey] = useState(+Date.now()); // hack to reset component to default state
  const [showSuccessfulMessage, setShowSuccessfulMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChooseAvatar = (avatar: string) => {
    setPlayerAvatar(avatar);
  };

  const handleCrop = (img: string) => {
    setImagePreview(img);
    setPlayerAvatar(img);
  };

  const handleClose = () => {
    setImagePreview(defaultAvatar);
    setPlayerAvatar(avatars[0]);
  };

  const handleBeforeUpload = (elem: unknown) => {
    console.log(elem);
  };

  const handleUpload = async () => {
    const result = await userService.uploadAvatar(playerAvatar);

    if (!result.error) {
      setResetKey(+Date.now());
      setShowSuccessfulMessage(true);
      setErrorMessage(null);
      setTimeout(() => {
        setShowSuccessfulMessage(false);
      }, MESSAGE_TIMEOUT);
    } else {
      setErrorMessage(`${result.error.statusCode}: ${result.error.message}`);
    }
  };

  return (
    <div className="container">
      <MotionContainer identKey="ProfilePage">
        <div className="box-container">
          <div className={styles.contents}>
            <h1 className="heading">User profile</h1>
            <div className={styles.avatars}>
              {[...avatars, imagePreview].map((avatar, idx) => (
                <button
                  key={idx}
                  className={`${styles.avatar} ${
                    avatar === playerAvatar ? styles.avatarChosen : ''
                  }`}
                  type="button"
                  role="radio"
                  aria-checked={avatar === playerAvatar}
                  onClick={() => handleChooseAvatar(avatar)}
                >
                  <img
                    src={avatar}
                    alt={`player avatar #${idx}`}
                  />
                </button>
              ))}
            </div>

            <div className={styles.avatarUploadCanvas}>
              <Avatar
                key={resetKey}
                label="Click to upload"
                width={400}
                height={400}
                imageHeight={400}
                mimeTypes="image/jpeg,image/png,image/webp"
                onClose={handleClose}
                onCrop={handleCrop}
                onBeforeFileLoad={handleBeforeUpload}
                exportAsSquare={true}
                exportSize={AVATAR_SIZE}
                exportMimeType="image/jpeg"
                exportQuality={0.75}
                labelStyle={{
                  color: '#fff',
                  fontSize: '48px',
                }}
              />
            </div>

            {showSuccessfulMessage && <p className={styles.successMessage}>Upload successful</p>}
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

            <button
              className={`btn ${styles.submitButton}`}
              type="button"
              onClick={() => {
                void handleUpload();
              }}
            >
              upload
            </button>
          </div>
        </div>
      </MotionContainer>
    </div>
  );
};

export default ProfilePage;
