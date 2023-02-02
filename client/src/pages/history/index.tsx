import React, { useEffect } from 'react';
import Table from 'rc-table';
import listify from 'listify';
import prettyMs from 'pretty-ms';
import { useDataStore } from '../../store/dataStore';

const HistoryPage = () => {
  const { historyResults, isOnline, actions } = useDataStore();

  useEffect(() => {
    actions.setHistoryList();
  }, [actions]);

  const columns = [
    {
      title: 'Players',
      dataIndex: 'players',
      render: (value: string[]) => <>{listify(value, { finalWord: '&' })}</>,
    },
    {
      title: 'Loser',
      dataIndex: 'loser',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      render: (value: number) => <>{prettyMs(value * 1000)}</>,
    },
    {
      title: 'Rounds',
      dataIndex: 'rounds',
    },
  ];

  return (
    <div>
      <h1 className="heading">History Page</h1>
      {isOnline ? (
        <Table
          columns={columns}
          data={historyResults}
          rowKey="id"
        />
      ) : (
        'Nothing'
      )}
    </div>
  );
};

export default HistoryPage;
