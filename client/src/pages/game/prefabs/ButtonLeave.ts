import { config } from '../index';
import { useGameStore } from '../../../store/gameStore';

export class ButtonLeave extends Phaser.GameObjects.Sprite {
  scene: Phaser.Scene;
  constructor(scene: Phaser.Scene) {
    super(scene, 60, 20, 'buttons', 'btn-leave');
    this.scene = scene;
    this.scene.add.existing(this);
    this.setScale(0.5);

    this.setInteractive().on('pointerdown', () => this.handleLeaveRoom());
    this.on('pointerover', () => this.setScale(0.51));
    this.on('pointerout', () => this.setScale(0.5));
  }

  handleLeaveRoom() {
    this.setFrame('btn-leave-disabled');
    useGameStore.getState().actions.leaveRoom();
    this.scene.scene.start('End');
    this.removeInteractive();
  }
}
