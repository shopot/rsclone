import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate } from 'typeorm';

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

  @Column({
    name: 'lastGameAt',
    type: 'int',
    default: () => 'unixepoch()',
  })
  lastGameAt: number;

  @BeforeUpdate()
  beforeUpdateActions() {
    this.lastGameAt = Math.round(Date.now() / 1000);
  }
}
