import { CardDto } from './../dto/card.dto';

export type TypePlacedCard = {
  attacker: CardDto[];
  defender: CardDto[];
};
