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

const renderHTML = (rawHTML: string) =>
  React.createElement('span', { dangerouslySetInnerHTML: { __html: rawHTML } });

const cardToString = (card: TypeCard) => {
  let suit = '';
  switch (card.suit) {
    case TypeCardSuit.Clubs:
      suit = '<span class="black">♣</span>';
      break;
    case TypeCardSuit.Diamonds:
      suit = '<span class="red">♦</span>';
      break;
    case TypeCardSuit.Hearts:
      suit = '<span class="red">♥</span>';
      break;
    case TypeCardSuit.Spades:
      suit = '<span class="black">♠</span>';
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

  const myPlayerName = useGameStore((state) => {
    const me = state.players.find((plr) => plr.socketId === socketId);

    return me?.playerName || 'John Doe';
  });

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

  const handleRestartGame = () => {
    actions.restartGame();
  };

  const handleOpenRoom = () => {
    actions.openRoom();
  };

  const handleAttackerPass = () => {
    actions.attackerPass();
  };

  const handleDefenderTake = () => {
    actions.defenderTake();
  };

  return (
    <div className="game-page">
      <h2 className={styles.title}>stats</h2>
      <div className={styles.info}>
        <div>
          <p>Online status: {isOnline ? 'online' : 'offline'}</p>
          <p>Room ID: {roomId}</p>
          <p>Room status: {roomStatus}</p>
          <p>Player Host socket ID: {hostSocketId}</p>
          {error && <p className="stats-error">Error: {error}</p>}
        </div>
        <div>
          <p className={socketId === activeSocketId ? styles.playerActive : ''}>
            Your player name: {myPlayerName}
          </p>
          <p>Your socket ID: {socketId}</p>
          <p className="info__active-player">Player Active socket ID: {activeSocketId}</p>
        </div>
        <div className="deck">
          <p>
            Trump card:{' '}
            <span className={styles.cardName}>{renderHTML(cardToString(trumpCard))}</span>
          </p>
          <p>
            Cards in the deck: <span className={styles.cardInDeck}>{deckCounter}</span>
          </p>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.title}>
          players
          <button
            style={{ marginLeft: '30px' }}
            className="btn"
            type="button"
            onClick={handleLeaveRoom}
          >
            leave room
          </button>
          {socketId === hostSocketId && roomStatus === TypeRoomStatus.GameIsOver && (
            <>
              <button
                style={{ marginLeft: '30px' }}
                className="btn"
                type="button"
                onClick={handleRestartGame}
              >
                restart game
              </button>
              <button
                style={{ marginLeft: '30px' }}
                className="btn"
                type="button"
                onClick={handleOpenRoom}
              >
                open room
              </button>
            </>
          )}
        </h2>
        <div className={styles.players}>
          {players.map((player) => (
            <div
              className={styles.player}
              key={player.socketId}
            >
              <h3 className={player.socketId === activeSocketId ? styles.playerActive : ''}>
                {player.playerName}
              </h3>
              <p>player socketId: {player.socketId}</p>
              <p>
                player role:{' '}
                <span
                  className={`${player.playerRole === 'Attacker' ? styles.attacker : ''}${
                    player.playerRole === 'Defender' ? styles.defender : ''
                  }`}
                >
                  {player.playerRole}
                </span>
              </p>
              <p>player status: {player.playerStatus}</p>
              <div>
                <h4>Cards of {player.socketId}</h4>
                <div className={styles.playerCards}>
                  {player.cards.map((card, idx) => (
                    <button
                      className="btn btnCard"
                      type="button"
                      key={idx}
                      disabled={activeSocketId !== socketId || activeSocketId !== player.socketId}
                      onClick={() => handleMakeMove(card)}
                    >
                      {socketId === player.socketId ? renderHTML(cardToString(card)) : '?'}
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
            <p>placed card pair {idx + 1}</p>
            <div>
              <button
                className="btn btnCard"
                type="button"
                key={`a-${idx}`}
                disabled={true}
              >
                {cardToString(placedCard.attacker)}
              </button>
              {placedCard.defender && (
                <button
                  className="btn btnCard"
                  type="button"
                  key={`d-${idx}`}
                  disabled={true}
                >
                  {cardToString(placedCard.defender)}
                </button>
              )}
            </div>
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
