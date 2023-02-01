import React, { useEffect } from 'react';
import { useHistoryStore } from '../../store/historyStore';

const HistoryPage = () => {
  const { results, isOnline, actions } = useHistoryStore();

  useEffect(() => {
    actions.setHistoryList();
  }, []);

  console.log(results);

  return (
    <div>
      {isOnline
        ? results.map((res) => {
            return `${res.players.join(' ')}`;
          })
        : 'Nothing'}
    </div>
  );
};

export default HistoryPage;
