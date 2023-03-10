export class IconBorder {
  params: { x: number; y: number; width: number; height: number; rounded: number };
  timer?: Phaser.Time.TimerEvent;
  counter: number;
  scene: Phaser.Scene;
  border: Phaser.GameObjects.Graphics;
  timerBorder: Phaser.GameObjects.Graphics;
  colors: { active: number; inactive: number; activeExpired: number };
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    rounded: number,
  ) {
    this.scene = scene;
    this.counter = 0;
    this.params = { x: x, y: y, width: width, height: height, rounded: rounded };
    this.colors = { active: 0x00ff00, inactive: 0x606060, activeExpired: 0xff9900 };
    this.border = this.scene.add.graphics();
    this.createBorder(false, false);
    this.timerBorder = this.scene.add.graphics();
  }

  createBorder(status: boolean, expired: boolean) {
    this.border.clear();
    const color =
      status && expired
        ? this.colors.activeExpired
        : status && !expired
        ? this.colors.active
        : this.colors.inactive;
    const { x, y, width, height, rounded } = this.params;
    this.border.lineStyle(4, color, 1).strokeRoundedRect(x, y, width, height, rounded);
  }

  destroy() {
    this.border?.destroy();
    this.timerBorder?.destroy();
  }

  createTimerBorder() {
    this.counter = 0;
    const { x, y, width, height, rounded } = this.params;
    this.timerBorder.clear();
    this.timerBorder.lineStyle(4, this.colors.inactive, 1);

    this.timer = this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.counter++;
        this.timerBorder.clear();
        this.timerBorder.lineStyle(4, this.colors.inactive, 1);
        if (this.counter < 15) color1(this.counter);
        else if (this.counter >= 15 && this.counter < 45) color2(this.counter - 15);
        else if (this.counter >= 45 && this.counter < 75) color3(this.counter - 45);
        else if (this.counter >= 75 && this.counter < 105) color4(this.counter - 75);
        else if (this.counter >= 105 && this.counter < 120) color5(this.counter - 105);
        else {
          this.createBorder(true, true);
          if (this.timer) this.scene.time.removeEvent(this.timer);
        }
      },
      callbackScope: this,
      repeat: 120,
    });

    const color1 = (counter: number) => {
      this.timerBorder
        .beginPath()
        .moveTo(x + width / 2, y)
        .lineTo(x + width / 2 + (width * counter) / 30, y)
        .strokePath();
    };

    const color2 = (counter: number) => {
      this.timerBorder
        .beginPath()
        .moveTo(x + width / 2, y)
        .lineTo(x + width, y)
        .lineTo(x + width, y + (height * counter) / 30)
        .strokePath();
    };

    const color3 = (counter: number) => {
      this.timerBorder
        .beginPath()
        .moveTo(x + width / 2, y)
        .lineTo(x + width, y)
        .lineTo(x + width, y + height)
        .lineTo(x + width - (width * counter) / 30, y + height)
        .strokePath();
    };

    const color4 = (counter: number) => {
      this.timerBorder
        .beginPath()
        .moveTo(x + width / 2, y)
        .lineTo(x + width, y)
        .lineTo(x + width, y + height)
        .lineTo(x, y + height)
        .lineTo(x, y + height - (height * counter) / 30)
        .strokePath();
    };

    const color5 = (counter: number) => {
      this.timerBorder
        .beginPath()
        .moveTo(x + width / 2, y)
        .lineTo(x + width, y)
        .lineTo(x + width, y + height)
        .lineTo(x, y + height)
        .lineTo(x, y)
        .lineTo(x + (width * counter) / 30, y)
        .strokePath();
    };
  }
}
