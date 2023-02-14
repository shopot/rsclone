import { useEffect, useState } from 'react';
import Table from 'rc-table';
import listify from 'listify';
import prettyMs from 'pretty-ms';
import { useDataStore } from '../../store/dataStore';

const HistoryPage = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const { historyResults, actions } = useDataStore();

  useEffect(() => {
    actions.setHistoryList();
    setDataLoaded(true);
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
      render: (value: number) => <>{prettyMs(value)}</>,
    },
    {
      title: 'Rounds',
      dataIndex: 'rounds',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      // Note: SQLite stores Unix timestamp in seconds; new Date expects it in milliseconds
      render: (value: number) => (
        <>{new Date(value * 1000).toLocaleString('en-GB', { dateStyle: 'short' })}</>
      ),
    },
  ];

  return (
    <div className="container">
      <div className="box-container">
        <h1 className="heading">Game History</h1>
        {dataLoaded && (
          <Table
            columns={columns}
            data={historyResults}
            rowKey="id"
          />
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
