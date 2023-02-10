import { config } from '../index';
import { IconBorder } from '../prefabs/IconBorder';
import { IconPic } from '../prefabs/IconPic';
import { Nickname } from '../prefabs/Nickname';

export class Icon {
  scene: Phaser.Scene;
  pic: IconPic;
  border: IconBorder;
  text: Nickname;
  socketId: string;
  constructor(
    scene: Phaser.Scene,
    index: number,
    tableSizes: { width: number; height: number; startX: number }[],
    nickname: string,
    socketId: string,
  ) {
    this.scene = scene;
    this.socketId = socketId;

    const x = tableSizes[index].startX;
    const spriteY = index === 0 ? config.height - config.cardSize.h + 25 : 82;
    //поменять на конркетную иконку
    this.pic = new IconPic(this.scene, x - 40, spriteY, 'icons', config.icons[index]);
    //должен меняться цвет рамки на зеленый, когда ходит и на серый после
    this.border = new IconBorder(this.scene, x - 68, spriteY - 27, 55, 55, 5);

    const textY = index === 0 ? spriteY - 55 : spriteY + 40;
    this.text = new Nickname(this.scene, x + 10, textY, nickname);
  }

  destroy() {
    this.pic.destroy();
    this.border.destroy();
    this.text.destroy();
    // this.destroy();
  }

  colorBorder(status: boolean) {
    this.border.createBorder(status);
  }
}
