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

    this.x = tableSizes[index].startX;
    this.spriteY = index === 0 ? config.height - config.cardSize.h + 25 : 82;
    this.pic = new IconPic(this.scene, this.x - 40, this.spriteY, 'icons', avatar);
    //должен меняться цвет рамки на зеленый, когда ходит и на серый после
    this.border = new IconBorder(this.scene, this.x - 68, this.spriteY - 27, 55, 55, 5);

    const textY = index === 0 ? this.spriteY - 55 : this.spriteY + 40;
    this.text = new Nickname(this.scene, this.x + 10, textY, nickname);
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
}
