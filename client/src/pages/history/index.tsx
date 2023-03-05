import { useEffect } from 'react';
import Table from 'rc-table';
import listify from 'listify';
import prettyMs from 'pretty-ms';
import { useDataStore } from '../../store/dataStore';
import { MotionContainer } from '../../components/MotionContainer';
import { historyService } from '../../services/historyService';

const HistoryPage = () => {
  const { history, actions } = useDataStore();

  useEffect(() => {
    void actions.setHistoryList(async () => {
      return await historyService.getAll();
    });
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
      render: (value: string) => <>{value === 'undefined' ? '-' : value}</>,
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
      <MotionContainer identKey="HistoryPage">
        <div className="box-container">
          <h1 className="heading">Game History</h1>
          {history.length === 0 && <p className="error-message">No data.</p>}
          {history.length > 0 && (
            <Table
              columns={columns}
              data={history}
              rowKey="id"
            />
          )}
        </div>
      </MotionContainer>
    </div>
  );
};

export default HistoryPage;
