import { useEffect } from 'react';
import Table from 'rc-table';
import { useDataStore } from '../../store/dataStore';
import { MotionContainer } from '../../components/MotionContainer';

const RatingPage = () => {
  const { ratingResults, actions } = useDataStore();
  console.log(ratingResults);
  useEffect(() => {
    actions.setRatingList();
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
          <Table
            columns={columns}
            data={ratingResults}
            rowKey="id"
          />
        </div>
      </MotionContainer>
    </div>
  );
};

export default RatingPage;
