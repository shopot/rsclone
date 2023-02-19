import { TypePlayerRole } from '../../../shared/types';
import { config } from '../index';
import { IconBorder } from '../prefabs/IconBorder';
import { IconPic } from '../prefabs/IconPic';
import { Nickname } from '../prefabs/Nickname';
import { SpeechBubble } from './SpeechBubble';

export class Icon {
  scene: Phaser.Scene;
  pic: IconPic;
  border: IconBorder;
  text: Nickname;
  socketId: string;
  x: number;
  spriteY: number;
  bubble: SpeechBubble | undefined;
  cloud: Phaser.GameObjects.Sprite;
  cloudColors: { attacker: number; defender: number; other: number };
  shieldSword: Phaser.GameObjects.Sprite;
  constructor(
    scene: Phaser.Scene,
    index: number,
    tableSizes: { width: number; height: number; startX: number }[],
    nickname: string,
    socketId: string,
    avatar: string,
  ) {
    this.scene = scene;
    this.socketId = socketId;
    this.cloudColors = { attacker: 0xff0000, defender: 0xd8ff00, other: 0x712b04 };

    this.x = tableSizes[index].startX;
    this.spriteY = index === 0 ? config.height - config.cardSize.h + 25 : 82;
    this.pic = new IconPic(this.scene, this.x - 40, this.spriteY, 'icons', avatar);
    //должен меняться цвет рамки на зеленый, когда ходит и на серый после
    this.border = new IconBorder(this.scene, this.x - 68, this.spriteY - 27, 55, 55, 5);

    const textY = index === 0 ? this.spriteY - 55 : this.spriteY + 40;
    this.cloud = this.scene.add
      .sprite(this.x - 20, textY - 13, 'clouds', 'blue')
      .setScale(1.7)
      .setOrigin(0, 0)
      .setTint(this.cloudColors.other)
      .setAlpha(0);
    this.text = new Nickname(this.scene, this.x + 30, textY - 5, nickname);
    this.shieldSword = this.scene.add
      .sprite(this.x - 0, textY - 7, 'shieldSword', 'shield')
      .setScale(0.5)
      .setOrigin(0, 0)
      .setAlpha(0);
  }

  destroy() {
    this.pic.destroy();
    this.border.destroy();
    this.text.destroy();
    // this.destroy();
  }

  colorBorder(status: boolean) {
    // setTimeout(() => this.border.createBorder(status), 300);
    this.border.createBorder(status);
  }

  createBubble(text: string, me: boolean) {
    this.bubble = new SpeechBubble(this.scene, text, this.x, this.spriteY, me);
    this.destroyBubble();
  }

  destroyBubble() {
    setTimeout(() => {
      this.bubble?.destroy();
    }, 3000);
  }

  colorCloud(role: TypePlayerRole) {
    const params = { color: 0, opacity: 0, texture: '' };
    params.color =
      role === TypePlayerRole.Attacker
        ? this.cloudColors.attacker
        : role === TypePlayerRole.Defender
        ? this.cloudColors.defender
        : this.cloudColors.other;
    params.opacity = role === TypePlayerRole.Attacker || role === TypePlayerRole.Defender ? 0.7 : 0;
    params.texture = role === TypePlayerRole.Attacker ? 'sword' : 'shield';
    this.cloud.setTint(params.color).setAlpha(params.opacity);
    this.shieldSword.setFrame(params.texture).setAlpha(params.opacity);
  }
}
