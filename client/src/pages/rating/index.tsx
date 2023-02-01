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
      render: (value: number) => ({
        children: new Date(value).toLocaleString(),
        props: {},
      }),
    },
  ];

  return (
    <div>
      {isOnline ? (
        <Table
          columns={columns}
          data={results}
          rowKey="player"
        />
      ) : (
        'Nothing'
      )}
    </div>
  );
};

export default RatingPage;
