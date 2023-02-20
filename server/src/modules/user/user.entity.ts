import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 32, nullable: false, unique: true })
  username: string;

  @Column({ type: 'text', nullable: false })
  hash: string;

  @Column({ type: 'text', nullable: true, default: 'default-avatar.webp' })
  avatar: string;

  @Column({ type: 'text', nullable: true, default: '' })
  refreshToken: string;

  @Column({ default: () => 'unixepoch()' })
  createdAt: number;

  @Column({
    default: () => 'unixepoch()',
    onUpdate: 'unixepoch()',
  })
  updatedAt: number;
}
