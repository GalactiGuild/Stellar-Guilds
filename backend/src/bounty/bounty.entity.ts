import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Bounty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  is_disputed: boolean = false;

  // Other existing columns
}