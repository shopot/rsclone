import { expect, test } from '@jest/globals';
import { TypePlayerStatus } from './../types/TypePlayerStatus';
import { TypePlayerMember } from './../types/TypePlayerMember';
import { Players } from './Players';
import { Player } from './Player';

const player1 = new Player(
  'socket-0',
  'Demon',
  TypePlayerMember.Host,
  TypePlayerStatus.InGame,
);

const player2 = new Player(
  'socket-0',
  'Alex',
  TypePlayerMember.Regular,
  TypePlayerStatus.YouWinner,
);

const player3 = new Player(
  'socket-0',
  'Candy',
  TypePlayerMember.Regular,
  TypePlayerStatus.InGame,
);

const player4 = new Player(
  'socket-0',
  'Rolando',
  TypePlayerMember.Regular,
  TypePlayerStatus.InGame,
);

const players = new Players([player1, player2, player3, player4]);

test('Test deepCopy', () => {
  expect(players.next(player1)).toEqual(player3);
});
