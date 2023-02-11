import { RoomCreateContainer } from '../../components/RoomCreateContainer';
import { RoomListContainer } from '../../components/RoomListContainer';

const RoomsPage = () => {
  return (
    <div className="container">
      <div className="box-container">
        <RoomCreateContainer />
        <RoomListContainer />
      </div>
    </div>
  );
};

export default RoomsPage;
