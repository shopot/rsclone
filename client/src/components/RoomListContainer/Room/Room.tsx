import listify from 'listify';
import styles from './Room.m.scss';
import featherSprite from 'feather-icons/dist/feather-sprite.svg';
import { MAX_NUMBER_OF_PLAYERS } from '../../../shared/constants';
import { TypePlayerDto } from '../../../shared/types';
import { RoomJoinContainer } from '../../RoomJoinContainer';

export const Room = ({ roomId, players, playersCount, isCanJoin }: IRoomProps) => {
  return (
    <li
      className={`${styles.roomListItem} ${isCanJoin ? styles.join : styles.disabled}`}
      key={roomId}
    >
      <div className={styles.roomListItemId}>room-{roomId}</div>
      <div className={styles.roomListItemPlayers}>
        <svg className="feather">
          <use href={`${featherSprite}#${playersCount === 1 ? 'user' : 'users'}`} />
        </svg>
        {playersCount}/{MAX_NUMBER_OF_PLAYERS}
      </div>
      <div className={styles.roomListPlayerNicknames}>
        {listify(
          players.map((player) => player.playerName),
          { finalWord: '&' },
        )}
      </div>
      <div className={styles.roomListItemAction}>
        <RoomJoinContainer
          isCanJoin={isCanJoin}
          roomId={roomId}
        />
      </div>
    </li>
  );
};

export declare interface IRoomProps {
  roomId: string;
  players: TypePlayerDto[];
  playersCount: number;
  isCanJoin: boolean;
  // onClickJoinRoom(roomId: string, playerName: string): void;
}

export declare interface IRoom {
  roomId: string;
  players: TypePlayerDto[];
  playersCount: number;
  isCanJoin: boolean;
}
