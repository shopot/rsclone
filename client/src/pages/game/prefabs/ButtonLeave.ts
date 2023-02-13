import { useGameStore } from '../../../store/gameStore';

export class ButtonLeave extends Phaser.GameObjects.Sprite {
  scene: Phaser.Scene;
  constructor(scene: Phaser.Scene) {
    super(scene, 40, 8, 'buttons', 'btn-leave');
    this.scene = scene;
    this.setOrigin(0, 0);
    this.scene.add.existing(this);
    this.setScale(0.5);

    this.setInteractive().on('pointerdown', () => this.handleLeaveRoom());
  }

  handleLeaveRoom() {
    this.setFrame('btn-leave-disabled');
    useGameStore.getState().actions.leaveRoom();
    this.scene.scene.start('End');
    this.removeInteractive();
  }
}
