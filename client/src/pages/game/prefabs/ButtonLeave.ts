import { useGameStore } from '../../../store/gameStore';

export class ButtonLeave extends Phaser.GameObjects.Sprite {
  scene: Phaser.Scene;
  constructor(scene: Phaser.Scene) {
    super(scene, 60, 20, 'roundBtns', 'button-leave');
    this.scene = scene;
    this.scene.add.existing(this);
    this.setScale(0.7);

    this.setInteractive().on('pointerdown', () => this.handleLeaveRoom());
    this.on('pointerover', () => this.setScale(0.72));
    this.on('pointerout', () => this.setScale(0.7));
  }

  handleLeaveRoom() {
    useGameStore.getState().actions.leaveRoom();
    this.scene.scene.start('End');
    this.removeInteractive();
  }
}
