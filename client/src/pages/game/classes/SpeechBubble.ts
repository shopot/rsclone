export class SpeechBubble {
  scene: Phaser.Scene;
  bubble: Phaser.GameObjects.Graphics;
  content: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, quote: string, x: number, y: number, me: boolean) {
    this.scene = scene;

    const bubbleWidth = 100;
    const bubbleHeight = 40;
    const bubblePadding = 10;
    const arrowHeight = bubbleHeight / 4;
    const coordX = x - 30;
    const coordY = me ? y - 90 : y + 50;
    this.bubble = this.scene.add.graphics({ x: coordX, y: coordY });
    //  Bubble shadow
    this.bubble.fillStyle(0x222222, 0.5);
    this.bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);
    //  Bubble color
    this.bubble.fillStyle(0xe7f0f9, 1);
    //  Bubble outline line style
    this.bubble.lineStyle(4, 0x565656, 1);
    //  Bubble shape and outline
    this.bubble
      .strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16)
      .fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

    //  Calculate arrow coordinates
    const point1X = Math.floor(bubbleWidth / 7);
    const point1Y = me ? bubbleHeight : 0;
    const point2X = Math.floor((bubbleWidth / 7) * 2);
    const point2Y = me ? bubbleHeight : 0;
    const point3X = Math.floor(bubbleWidth / 7);
    const point3Y = me ? Math.floor(bubbleHeight + arrowHeight) : -arrowHeight;

    //  Bubble arrow fill
    this.bubble
      .fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y)
      .lineStyle(2, 0x565656, 1)
      .lineBetween(point2X, point2Y, point3X, point3Y)
      .lineBetween(point1X, point1Y, point3X, point3Y);

    this.content = this.scene.add.text(0, 0, quote, {
      fontFamily: 'Signika',
      color: '#000000',
      align: 'center',
      wordWrap: { width: bubbleWidth - bubblePadding * 2 },
    });
  }

  destroy() {
    this.bubble.destroy();
    this.content.destroy();
  }

  setVisibility(num: number) {
    this.bubble.setAlpha(num);
    this.content.setAlpha(num);
  }

  changeText(text: string) {
    const bubbleWidth = 100;
    const bubbleHeight = 40;
    this.content.setText(text);
    const b = this.content.getBounds();

    this.content.setPosition(
      this.bubble.x + bubbleWidth / 2 - b.width / 2,
      this.bubble.y + bubbleHeight / 2 - b.height / 2,
    );
  }
}
