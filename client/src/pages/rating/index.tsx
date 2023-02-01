import React, { useEffect } from 'react';
import { useRatingStore } from '../../store/ratingStore';

const RatingPage = () => {
  const { results, isOnline, actions } = useRatingStore();
  useEffect(() => {
    actions.setRatingList();
  }, []);

  console.log(results);

  return (
    <div>
      {isOnline
        ? results.map((res) => {
            return res.player;
          })
        : 'Nothing'}
    </div>
  );
};

export default RatingPage;
