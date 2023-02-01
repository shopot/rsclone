import { Card } from './Card';
import { TypePlayerMember } from '../types/TypePlayerMember';
import { TypePlayerStatus } from '../types';
import { CardDto } from './CardDto';

export class Player {
  socketId; // socket.id wtf string?
  name: string;
  cards: Card[];
  memberStatus: TypePlayerMember;
  playerStatus: TypePlayerStatus;
  isDefender;

  constructor(
    socketId: string,
    name: string,
    memberStatus: TypePlayerMember = TypePlayerMember.Regular,
  ) {
    this.socketId = socketId;
    this.name = name;
    this.cards = [];
    this.memberStatus = memberStatus;
    this.isDefender = false;
  }

  public getPlayerId() {
    return this.name;
  }

  public getSocketId() {
    return this.socketId;
  }

  public getCardsCount() {
    return this.cards.length;
  }

  public addCards(cards: Card[]) {
    return this.cards.concat(cards);
  }

  public getCards() {
    return this.cards;
  }

  public setPlayerStatus(status: TypePlayerStatus) {
    this.playerStatus = status;
  }

  public getPlayerStatus() {
    return this.playerStatus;
  }

  public lostCard(cardDto: CardDto) {
    this.cards = this.cards.filter(
      (card) => card.rank !== cardDto.rank && card.suit !== cardDto.suit,
    );
  }
}
