import { MotionContainer } from '../../components/MotionContainer';
import { RoomCreateContainer } from '../../components/RoomCreateContainer';
import { RoomListContainer } from '../../components/RoomListContainer';

const RoomsPage = () => {
  return (
    <div className="container">
      <MotionContainer identKey="RoomsPage">
        <div className="box-container">
          <RoomCreateContainer />
          <RoomListContainer />
        </div>
      </MotionContainer>
    </div>
  );
};

export default RoomsPage;
