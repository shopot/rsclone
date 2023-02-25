import styles from './PlayerInfo.m.scss';

interface PlayerInfoProps {
  playerName: string;
  avatarURL: string;
}

export const PlayerInfo = ({ playerName, avatarURL }: PlayerInfoProps) => {
  return (
    <div className={styles.playerInfo}>
      <img
        src={avatarURL}
        alt={`}Avatar of ${playerName}`}
      />
      <p className={styles.playerName}>{playerName}</p>
    </div>
  );
};
