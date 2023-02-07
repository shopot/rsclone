import { TypeCard } from './TypeCard';

export type TypePlacedCard = {
  attacker: TypeCard;
  defender: TypeCard | null;
};
