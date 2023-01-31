import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rating')
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, nullable: false })
  player: string;

  @Column({ default: 0 })
  wins: number;

  @Column({ default: 0 })
  total: number;

  @Column({ default: () => 'unixepoch()' })
  lastGameAt: number;
}
