import { TypeCardDto } from './TypeCardDto';

export type TypePlacedCard = {
  attacker: TypeCardDto;
  defender: TypeCardDto | null;
};
