import { useEffect } from 'react';
import Table from 'rc-table';
import { useDataStore } from '../../store/dataStore';

const RatingPage = () => {
  const { ratingResults, isOnline, actions } = useDataStore();
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
      render: (value: number) => <>{new Date(value).toLocaleString()}</>,
    },
  ];

  return (
    <div className="container">
      <div className="box-container">
        <h1 className="heading">Rating Table</h1>
        {isOnline ? (
          <Table
            columns={columns}
            data={ratingResults}
            rowKey="id"
          />
        ) : (
          'Nothing'
        )}
      </div>
    </div>
  );
};

export default RatingPage;
