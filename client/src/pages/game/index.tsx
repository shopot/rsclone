import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { TypeCard, TypeCardRank, TypeCardSuit } from '../../shared/types';
import styles from './styles.m.scss';

const cardToString = (card: TypeCard) => {
  let suit = '';
  switch (card.suit) {
    case TypeCardSuit.Clubs:
      suit = '♣';
      break;
    case TypeCardSuit.Diamonds:
      suit = '♦';
      break;
    case TypeCardSuit.Hearts:
      suit = '♥';
      break;
    case TypeCardSuit.Spades:
      suit = '♠';
      break;
  }

  let rank = '';
  switch (card.rank) {
    case TypeCardRank.RANK_J:
      rank = 'J';
      break;
    case TypeCardRank.RANK_Q:
      rank = 'Q';
      break;
    case TypeCardRank.RANK_K:
      rank = 'K';
      break;
    case TypeCardRank.RANK_A:
      rank = 'A';
      break;
    default:
      rank = card.rank.toString();
  }

  return `${rank}${suit}`;
};

const GamePage = () => {
  const {
    isOnline,
    roomId,
    roomStatus,
    hostPlayerId,
    activePlayerId,
    deckCounter,
    trumpCard,
    players,
    dealt,
    placedCards,
    error,
  } = useGameStore();

  const handleMakeMove = (card: TypeCard) => {
    console.log(card);
  };

  return (
    <div>
      <section className={styles.section}>
        <h2>stats</h2>
        <p>Online status: {isOnline ? 'online' : 'offline'}</p>
        {error && <p>Error: {error}</p>}
        <p>Room ID: {roomId}</p>
        <p>Room status: {roomStatus}</p>
        <p>Host player ID: {hostPlayerId}</p>
        <p>Active player ID: {activePlayerId}</p>
        <p>Trump card: {cardToString(trumpCard)}</p>
        <p>Cards in the deck: {deckCounter}</p>
      </section>

      <section className={styles.section}>
        <h2>players</h2>
        <div className={styles.player}>
          {players.map((player) => (
            <>
              <h3>{player.playerId}</h3>
              <p>player role: {player.playerRole}</p>
              <p>player status: {player.playerStatus}</p>
              <p>Cards:</p>
              <div>
                <h4>cards of ${player.playerId}</h4>
                <div className={styles.playerCards}>
                  {player.cards.map((card, idx) => (
                    <button
                      className="btn"
                      type="button"
                      key={idx}
                      onClick={() => handleMakeMove(card)}
                    >
                      {cardToString(card)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>dealt cards</h2>
        {dealt.map((player, idx) => (
          <p key={idx}>
            {player.playerId}: {player.count}
          </p>
        ))}
      </section>

      <section className={styles.section}>
        <h2>placed cards</h2>
        {placedCards.map((placedCard, idx) => (
          <div key={idx}>
            <p>placed attacker card {idx}: cardToString(placedCard.attacker)</p>
            <p>
              {placedCard.defender && (
                <>
                  placed defender card {idx}: {cardToString(placedCard.defender)}
                </>
              )}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default GamePage;
