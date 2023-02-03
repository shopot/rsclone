import { Card } from './Card';
import { TypePlayerRole, TypePlayerStatus, TypePlayerMember } from '../types';
import { CardDto } from '../dto';

export class Player {
  socketId; // socket.id wtf string?
  name: string;
  cards: Card[];
  memberStatus: TypePlayerMember;
  playerStatus: TypePlayerStatus;
  playerRole: TypePlayerRole;

  constructor(
    socketId: string,
    name: string,
    memberStatus: TypePlayerMember = TypePlayerMember.Regular,
    playerStatus: TypePlayerStatus = TypePlayerStatus.InGame,
  ) {
    this.socketId = socketId;
    this.name = name;
    this.cards = [];
    this.memberStatus = memberStatus;
    this.playerStatus = playerStatus;
    this.playerRole = TypePlayerRole.Waiting;
  }

  public setRole(role: TypePlayerRole): void {
    this.playerRole = role;
  }

  public getRole(): TypePlayerRole {
    return this.playerRole;
  }

  public getSocketId(): string {
    return this.socketId;
  }

  public getPlayerId() {
    return this.name;
  }

  public getCardsCount() {
    return this.cards.length;
  }

  public addCards(cards: Card[]) {
    this.cards = this.cards.concat(cards);
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
