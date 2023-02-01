import React, { useEffect } from 'react';
import Table from 'rc-table';
import { useRatingStore } from '../../store/ratingStore';

const RatingPage = () => {
  const { results, isOnline, actions } = useRatingStore();
  useEffect(() => {
    actions.setRatingList();
  }, []);

  console.log(results);
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
    <div>
      {isOnline ? (
        <Table
          columns={columns}
          data={results}
          rowKey="id"
        />
      ) : (
        'Nothing'
      )}
    </div>
  );
};

export default RatingPage;
