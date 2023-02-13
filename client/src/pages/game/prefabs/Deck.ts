import { config } from '../index';
import { Card } from './Card';

export class Deck {
  scene: Phaser.Scene;
  sprites: Card[] = [];
  constructor(scene: Phaser.Scene, amt: number) {
    this.scene = scene;

    const max = amt > 8 ? 8 : amt - 1;
    for (let i = 0; i < max - 1; i++) {
      const card = new Card(
        this.scene,
        70 - i / 2,
        config.height / 2 - i,
        'cards',
        'cardBack',
      ).setAngle(10);
      card.makeNotClickable();
      this.sprites.push(card);
    }
  }
  destroy() {
    this.sprites.forEach((el) => el.destroy());
    this.destroy();
  }
}
