import { useEffect } from 'react';
import Table from 'rc-table';
import { useDataStore } from '../../store/dataStore';

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
      render: (value: number) => <>{new Date(value * 1000).toLocaleString()}</>,
    },
  ];

  return (
    <div className="container">
      <div className="box-container">
        <h1 className="heading">Rating Table</h1>
        <Table
          columns={columns}
          data={ratingResults}
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default RatingPage;
