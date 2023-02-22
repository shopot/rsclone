import { useEffect } from 'react';
import Table from 'rc-table';
import { useDataStore } from '../../store/dataStore';
import { MotionContainer } from '../../components/MotionContainer';
import { ratingService } from '../../services';

const RatingPage = () => {
  const { rating, actions } = useDataStore();

  useEffect(() => {
    void actions.setRatingList(async () => {
      return await ratingService.getAll();
    });
  }, [actions]);

  const columns = [
    {
      title: 'Player name',
      dataIndex: 'player',
    },
    {
      title: 'Wins',
      dataIndex: 'wins',
    },
    {
      title: 'Games played',
      dataIndex: 'total',
    },
    {
      title: 'Last time played',
      dataIndex: 'lastGameAt',
      // Note: SQLite stores Unix timestamp in seconds; new Date expects it in milliseconds
      render: (value: number) => (
        <>
          {new Date(value * 1000).toLocaleString('en-GB', {
            hourCycle: 'h24',
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </>
      ),
    },
  ];

  return (
    <div className="container">
      <MotionContainer identKey="HistoryPage">
        <div className="box-container">
          <h1 className="heading">Rating Table</h1>
          {rating.length === 0 && <p className="error-message">No data!</p>}
          {rating.length > 0 && (
            <Table
              columns={columns}
              data={rating}
              rowKey="id"
            />
          )}
        </div>
      </MotionContainer>
    </div>
  );
};

export default RatingPage;
