import axios from 'axios';
import { useState } from 'react';
import { MotionContainer } from '../../components/MotionContainer';
import Avatar from 'react-avatar-edit';
import { avatars } from '../../shared/avatars';
import { AVATAR_SIZE } from '../../shared/constants';
import { HTTP_ENDPOINT } from '../../app/config';
import styles from './styles.m.scss';

const ProfilePage = () => {
  const [playerAvatar, setPlayerAvatar] = useState('');
  const [imagePreview, setImagePreview] = useState<string>(avatars[0]);

  const handleChooseAvatar = (avatar: string) => {
    setPlayerAvatar(avatar);
  };

  const handleCrop = (img: string) => {
    setImagePreview(img);
  };

  const handleClose = () => {
    setImagePreview(avatars[0]);
  };

  const handleBeforeUpload = (elem: unknown) => {
    console.log(elem);
  };

  function DataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',');
    const byteString =
      splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);

    return new Blob([ia], { type: mimeString });
  }

  const handleUpload = () => {
    const formData = new FormData();
    const file = DataURIToBlob(playerAvatar);
    formData.append('image', file, 'avatar.jpg');
    for (const key of formData.keys()) {
      console.log(key);
    }

    axios
      .post('user/upload', formData, {
        baseURL: HTTP_ENDPOINT,
        withCredentials: true,
        headers: { Accept: 'application/json' },
      })
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
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
                className={`${styles.avatar} ${avatar === playerAvatar ? styles.avatarChosen : ''}`}
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
          <Avatar
            width={400}
            height={400}
            imageWidth={400}
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
          <img
            src={imagePreview}
            alt="cropped avatar preview"
          />
          <button
            className="btn"
            type="button"
            onClick={handleUpload}
          >
            upload
          </button>
        </div>
      </MotionContainer>
    </div>
  );
};

export default ProfilePage;
