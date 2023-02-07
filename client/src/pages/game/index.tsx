import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGameStore } from '../../store/gameStore';
import { socketIOService } from '../../shared/api/socketio';
import {
  TypeCard,
  TypeCardRank,
  TypeCardSuit,
  TypeRoomStatus,
  TypePlayerRole,
} from '../../shared/types';
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
  const navigate = useNavigate();
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

  const isFirstAttackInRound = useGameStore((state) => state.placedCards.length === 0);

  const activePlayerRole = useGameStore((state) => {
    const activePlayer = state.players.find((plr) => plr.socketId === state.activeSocketId);

    return activePlayer?.playerRole || TypePlayerRole.Unknown;
  });

  const socketId = socketIOService.getSocketId();

  useEffect(() => {
    actions.setGameState();
  }, [actions]);

  const handleMakeMove = (card: TypeCard) => {
    if (activePlayerRole === TypePlayerRole.Attacker) {
      actions.makeAttackingMove(card);
    } else if (activePlayerRole === TypePlayerRole.Defender) {
      actions.makeDefensiveMove(card);
    }
  };

  const handleStartGame = () => {
    actions.startGame();
  };

  const handleLeaveRoom = () => {
    actions.leaveRoom();
    navigate('/');
  };

  const handleAttackerPass = () => {
    actions.attackerPass();
  };

  const handleDefenderTake = () => {
    actions.defenderTake();
  };

  return (
    <div>
      <section className={styles.section}>
        <h2>stats</h2>
        <p>Online status: {isOnline ? 'online' : 'offline'}</p>
        {error && <p>Error: {error}</p>}
        <p>Room ID: {roomId}</p>
        <p>Room status: {roomStatus}</p>
        <p className={socketId === activeSocketId ? styles.playerActive : ''}>
          Your socket ID: {socketId}
        </p>
        <p>Host socket ID: {hostSocketId}</p>
        <p>Active socket ID: {activeSocketId}</p>
        <p>Trump card: {cardToString(trumpCard)}</p>
        <p>Cards in the deck: {deckCounter}</p>
      </section>

      <section className={styles.section}>
        <h2>players</h2>
        {players.map((player) => (
          <div
            className={styles.player}
            key={player.socketId}
          >
            <h3 className={player.socketId === activeSocketId ? styles.playerActive : ''}>
              {player.socketId}
            </h3>
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
            <p>
              placed card pair {idx + 1}: {cardToString(placedCard.attacker)}
              {placedCard.defender && ` ${cardToString(placedCard.defender)}`}
            </p>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.uiButtons}>
          {roomStatus === TypeRoomStatus.WaitingForStart && socketId === hostSocketId && (
            <button
              className="btn"
              type="button"
              onClick={handleStartGame}
            >
              start game
            </button>
          )}
          <button
            className="btn"
            type="button"
            onClick={handleLeaveRoom}
          >
            leave room
          </button>
          {roomStatus === TypeRoomStatus.GameInProgress &&
            socketId === activeSocketId &&
            !isFirstAttackInRound &&
            activePlayerRole === TypePlayerRole.Attacker && (
              <button
                className="btn"
                type="button"
                onClick={handleAttackerPass}
              >
                pass
              </button>
            )}
          {roomStatus === TypeRoomStatus.GameInProgress &&
            socketId === activeSocketId &&
            activePlayerRole === TypePlayerRole.Defender && (
              <button
                className="btn"
                type="button"
                onClick={handleDefenderTake}
              >
                take
              </button>
            )}
        </div>
      </section>
    </div>
  );
};

export default GamePage;
