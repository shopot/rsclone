import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('history')
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 8, nullable: false, unique: true })
  roomId: string;

  // Player names with separator "#", example: "Alex#Demon#Olga"
  @Column({ length: 255, default: '' })
  players: string;

  // Player name, example: "Alex"
  @Column({ length: 32, default: '' })
  loser: string;

  @Column({ default: 0 })
  duration: number;

  @Column({ default: 0 })
  rounds: number;

  @Column({ default: () => 'unixepoch()' })
  createdAt: number;
}
