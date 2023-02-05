import { Card } from './Card';
import { config } from '../index';

export class MainCard extends Card {
  init() {
    super.init();
    this.setInteractive();
    super.open();
    // this.on('pointerdown', this.move, this);
  }
}
