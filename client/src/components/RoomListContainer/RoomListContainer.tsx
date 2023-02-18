import { useEffect } from 'react';
import { socketIOService } from '../../shared/api/socketio';
import { MAX_NUMBER_OF_PLAYERS } from '../../shared/constants';
import { TypeRoomStatus, TypeSocketEvent } from '../../shared/types';
import { useRoomsStore } from '../../store/roomsStore';
import { RoomList } from './RoomList';

export const RoomListContainer = () => {
  const rooms = useRoomsStore((state) => state.rooms);

  useEffect(() => {
    // Get rooms list
    socketIOService.emit(TypeSocketEvent.GameRooms, { data: {} });
  }, []);

  const roomsList = rooms
    .map((room) => {
      const { roomId, players, playersCount, status } = room;

      const isCanJoin =
        room.playersCount < MAX_NUMBER_OF_PLAYERS &&
        [TypeRoomStatus.WaitingForPlayers, TypeRoomStatus.WaitingForStart].includes(status);

      return {
        roomId,
        players,
        playersCount,
        isCanJoin,
      };
    })
    .sort((a, b) => b.playersCount - a.playersCount);

  return <RoomList rooms={roomsList} />;
};
