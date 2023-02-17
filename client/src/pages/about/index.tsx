import { MotionContainer } from '../../components/MotionContainer';
import styles from './styles.m.scss';

const AboutPage = () => {
  return (
    <MotionContainer identKey="AboutPage">
      <div className="container">
        <section className={`box-container ${styles.rulesSection}`}>
          <h1 className="heading">Game Rules</h1>
          <ul className={styles.rulesList}>
            <li>2-4 players</li>
            <li>36 cards in the deck; 6 is the lowest card rank</li>
            <li>each player is dealt six cards</li>
            <li>
              the bottom card of the stock is turned and placed face up on the table, its suit
              determining the trump suit for the current deal
            </li>
            <li>a trump card of any rank beats all cards in the other three suits</li>
            <li>
              the player who has the lowest trump card will be the first attacker (first time the
              game is played)
            </li>
            <li>the player to the attacker&apos;s left is always the defender</li>
            <li>
              as many attacks can be made as the defender has cards up to a maximum of six (five in
              the 1st round)
            </li>
            <li>
              the attacker opens their turn by playing a card face up on the table as an attacking
              card
            </li>
            <li>
              the defender responds to the attack with a higher-ranking defending card from their
              hand
            </li>
            <li>
              the defender must play a higher card of the same suit as the attack card or play a
              card of the trump suit
            </li>
            <li>
              if a defender is unwilling or unable to beat the most recent attack card, they may
              give up their defence and must pick up all the cards played during that round of
              attack
            </li>
            <li>
              for each new attack which is defended successfully by the defender, the player who led
              that attack (played the last attack card) may start a new attack
            </li>
            <li>
              if they cannot or if they pass, then the player to the left of the defender may start
              a new attack or pass the chance to attack to the next non-defender going clockwise
              around the table
            </li>
            <li>
              after the original attack, attacks can only be made if the new attack card matches the
              rank of any card which has already been played during that round
            </li>
            <li>
              if no other players are willing to make another attack or if the defender beats the
              last attack card, the defender has won the round of attacks
            </li>
            <li>
              in this case all cards from that round of attack are placed in the discard pile and
              the defender starts a new round of attacks as the attacker and the player to his or
              her left becomes the new defender
            </li>
            <li>
              but if the attack succeeds, the defender loses their turn and the attack passes to the
              player on the defender&apos;s left
            </li>
            <li>
              at the end of each round of attacks, each player draws new cards from the deck until
              they have six cards in their hand unless the deck has been exhausted
            </li>
            <li>
              the main attacker draws as many cards as necessary first, followed by any other
              attackers in clockwise order, and finally the defender
            </li>
            <li>the last person left with cards in their hand is the loser (the fool or durak)</li>
            <li>
              The player to the fool&apos;s right becomes the first attacker for the next game
              session
            </li>
          </ul>
        </section>
      </div>
    </MotionContainer>
  );
};

export default AboutPage;
