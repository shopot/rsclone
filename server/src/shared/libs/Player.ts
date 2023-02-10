import { TypeCard } from './../types/TypeCard';
import { Socket } from 'socket.io';
import { Card } from './Card';
import { TypePlayerRole, TypePlayerStatus, TypePlayerMember } from '../types';

export class Player {
  socket: Socket;
  playerName: string;
  cards: Card[];
  memberStatus: TypePlayerMember;
  playerStatus: TypePlayerStatus;
  playerRole: TypePlayerRole;

  constructor(
    socket: Socket,
    playerName: string,
    memberStatus: TypePlayerMember = TypePlayerMember.Regular,
    playerStatus: TypePlayerStatus = TypePlayerStatus.InGame,
  ) {
    this.socket = socket;
    this.playerName = playerName;
    this.cards = [];
    this.memberStatus = memberStatus;
    this.playerStatus = playerStatus;
    this.playerRole = TypePlayerRole.Waiting;
  }

  public setPlayerRole(role: TypePlayerRole): void {
    this.playerRole = role;
  }

  public getPlayerRole(): TypePlayerRole {
    return this.playerRole;
  }

  public getSocket(): Socket {
    return this.socket;
  }

  public getSocketId(): string {
    return this.socket.id;
  }

  public getPlayerName() {
    return this.playerName;
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

  public getCardsAsDto() {
    return this.cards.map((card) => card.getCardDto());
  }

  public setPlayerStatus(status: TypePlayerStatus) {
    this.playerStatus = status;
  }

  public getPlayerStatus() {
    return this.playerStatus;
  }

  public lostCard(cardDto: TypeCard) {
    this.cards = this.cards.filter(
      (card) => card.rank !== cardDto.rank || card.suit !== cardDto.suit,
    );
  }

  public getPlayerAsDto() {
    return {
      socketId: this.getSocketId(),
      playerName: this.getPlayerName(),
      playerRole: this.getPlayerRole(),
      playerStatus: this.getPlayerStatus(),
      cards: this.getCardsAsDto(),
    };
  }
}
