import { useEffect } from 'react';
import { socketIOService } from '../../shared/api/socketio';
import { MAX_NUMBER_OF_PLAYERS } from '../../shared/constants';
import { TypeRoomStatus, TypeSocketEvent } from '../../shared/types';
import { RoomList } from './RoomList';

const roomData = [
  {
    playersCount: 1,
    roomId: '95a0a45358',
    status: TypeRoomStatus.WaitingForPlayers,
  },
  {
    playersCount: 4,
    roomId: '95a0a45358',
    status: TypeRoomStatus.GameInProgress,
  },
  {
    playersCount: 1,
    roomId: '95a0a45358',
    status: TypeRoomStatus.WaitingForPlayers,
  },
  {
    playersCount: 4,
    roomId: '95a0a45358',
    status: TypeRoomStatus.WaitingForPlayers,
  },
  {
    playersCount: 2,
    roomId: '95a0a45358',
    status: TypeRoomStatus.WaitingForPlayers,
  },
];

export const RoomListContainer = () => {
  // const rooms = useRoomsStore((state) => state.rooms);

  const rooms = roomData
    .map((room) => {
      const { roomId, playersCount, status } = room;

      const isCanJoin =
        room.playersCount < MAX_NUMBER_OF_PLAYERS &&
        [TypeRoomStatus.WaitingForPlayers, TypeRoomStatus.WaitingForStart].includes(status);

      return {
        roomId,
        playersCount,
        isCanJoin,
      };
    })
    .sort((a, b) => b.playersCount - a.playersCount);

  useEffect(() => {
    // Get rooms list
    socketIOService.emit(TypeSocketEvent.GameRooms, { data: {} });
  }, []);

  return <RoomList rooms={rooms} />;
};
