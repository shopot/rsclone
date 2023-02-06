import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { socketIOService } from '../../shared/api/socketio';
import { TypeCard, TypeCardRank, TypeCardSuit, TypeRoomStatus } from '../../shared/types';
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
    actions,
    isOnline,
    roomId,
    roomStatus,
    hostSocketId,
    activeSocketId,
    deckCounter,
    trumpCard,
    players,
    dealt,
    placedCards,
    error,
  } = useGameStore();

  const socketId = socketIOService.getSocketId();

  useEffect(() => {
    actions.setGameState();
  }, [actions]);

  const handleMakeMove = (card: TypeCard) => {
    actions.makeAttackingMove(card);
  };

  const handleStartGame = () => {
    actions.startGame();
  };

  return (
    <div>
      <section className={styles.section}>
        <h2>stats</h2>
        <p>Online status: {isOnline ? 'online' : 'offline'}</p>
        {error && <p>Error: {error}</p>}
        <p>Room ID: {roomId}</p>
        <p>Room status: {roomStatus}</p>
        <p>Your socket ID: {socketId}</p>
        <p>Host socket ID: {hostSocketId}</p>
        <p>Active socket ID: {activeSocketId}</p>
        <p>Trump card: {cardToString(trumpCard)}</p>
        <p>Cards in the deck: {deckCounter}</p>
      </section>

      <section className={styles.section}>
        <h2>players</h2>
        <div className={styles.player}>
          {players.map((player) => (
            <div key={player.socketId}>
              <h3>{player.socketId}</h3>
              <p>player role: {player.playerRole}</p>
              <p>player status: {player.playerStatus}</p>
              <div>
                <h4>Cards of {player.socketId}</h4>
                <div className={styles.playerCards}>
                  {player.cards.map((card, idx) => (
                    <button
                      className="btn"
                      type="button"
                      key={idx}
                      disabled={activeSocketId !== socketId || activeSocketId !== player.socketId}
                      onClick={() => handleMakeMove(card)}
                    >
                      {socketId === player.socketId ? cardToString(card) : '?'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>dealt cards</h2>
        {dealt.map((player) => (
          <p key={player.socketId}>
            {player.socketId}: {player.count}
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

      <section className={styles.section}>
        <div>
          {roomStatus === TypeRoomStatus.WaitingForStart && socketId === hostSocketId && (
            <button
              className="btn"
              type="button"
              onClick={handleStartGame}
            >
              start game
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default GamePage;
