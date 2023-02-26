export interface ICreateRatingDto {
  userId: number;
  player: string;
  wins?: number;
  total?: number;
}
