import { Room, IRoom } from '../Room/Room';
import styles from './RoomList.m.scss';

export const RoomList = ({ rooms }: IRoomListProps) => {
  return (
    <ul className={styles.roomList}>
      {rooms.map((room: IRoom) => (
        <Room
          key={room.roomId}
          {...room}
        />
      ))}
    </ul>
  );
};

export declare interface IRoomListProps {
  rooms: IRoom[];
}
