import { TypeChatMessage } from '../../../shared/types';
import { useGameStore } from '../../../store/gameStore';
import { config } from '../index';

export class Chat {
  scene: Phaser.Scene;
  chatText: Phaser.GameObjects.Text;
  formHtml: Phaser.GameObjects.DOMElement;
  enterKey: Phaser.Input.Keyboard.Key;
  btn: Phaser.GameObjects.Sprite;
  open: boolean;
  wrapParams: { x: number; y: number };
  formParams: { x: number; y: number };
  chatParams: { x: number; y: number };
  bntParams: { x: number; y: number };
  wrapper: Phaser.GameObjects.Sprite;
  circle: Phaser.GameObjects.Sprite;
  newMessagesAmt: Phaser.GameObjects.Text;
  counter: number;
  sound: Phaser.Sound.BaseSound;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.open = false;
    this.wrapParams = { x: config.width - 130, y: 375 };
    this.formParams = { x: config.width - 250, y: 450 };
    this.chatParams = { x: config.width - 255, y: 255 };

    this.wrapper = this.scene.add
      .sprite(this.wrapParams.x, this.wrapParams.y, 'chatWrapper')
      .setDepth(200)
      .setAlpha(0);
    this.formHtml = this.scene.add
      .dom(this.formParams.x, this.formParams.y)
      .createFromCache('formHtml')
      .setOrigin(0)
      .setDepth(201)
      .setAlpha(0);

    this.chatText = this.scene.add
      .text(this.chatParams.x, this.chatParams.y, 'chatbot: Start chatting here )', {
        backgroundColor: '#E7F0F9',
        color: '#000',
        font: '18px Arial',
      })
      .setPadding(6)
      .setFixedSize(250, 240)
      .setAlign('justify')
      .setDepth(202)
      .setAlpha(0)
      .setWordWrapWidth(245, true);

    this.enterKey = this.scene.input.keyboard
      .addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      .on('down', (event: KeyboardEvent) => {
        const formInput = this.formHtml?.getChildByName('chat');
        if (formInput instanceof HTMLInputElement && formInput.value !== '') {
          useGameStore.getState().actions.sendMessage(formInput.value);
          formInput.value = '';
        }
      });

    this.btn = this.scene.add.sprite(0, 0, 'roundBtns', 'button-chat');
    const a = config.width;
    const b = config.playersHands[1][0].width;
    this.bntParams = { x: (3 * a + b) / 4, y: config.height - config.playersHands[1][0].height };
    this.btn
      .setPosition(this.bntParams.x, this.bntParams.y)
      .setScale(0.7)
      .setInteractive({ cursor: 'pointer' })
      .on('pointerdown', () => this.handleOpenClose())
      .on('pointerover', () => this.btn.setScale(0.75))
      .on('pointerout', () => this.btn.setScale(0.7));

    this.circle = this.scene.add
      .sprite(this.bntParams.x, this.bntParams.y, 'redCircle')
      .setScale(0.73)
      .setAlpha(0);

    this.newMessagesAmt = this.scene.add
      .text(this.bntParams.x, this.bntParams.y, '', {
        color: '#fff',
        font: '22px Arial bold',
      })
      .setOrigin(0.5);

    this.counter = 0;
    this.sound = this.scene.sound.add('newMessage');
  }

  updateChat(chatContent: TypeChatMessage[]) {
    const chat: string[] = [];
    const LINES = 9;
    const COLS = 27;
    // chatContent.forEach((el) => {
    //   const str = `${el.sender.playerName}: ${el.message}`;
    //   chat.push(str);
    // });
    chatContent.forEach((el) => {
      const str = `${el.sender.playerName}: ${el.message}`;
      const strToArr = str.split(' ');
      const copyArr = [...strToArr];

      const splitWords = (arr: string[]) => {
        let text = arr[0];
        for (let i = 1; i < arr.length; i++) {
          if ((text + arr[i]).length < COLS) {
            text = text + ' ' + arr[i];
          } else {
            return { str: text, ind: i };
          }
        }
        return { str: '', ind: 0 };
      };

      while (copyArr.join(' ').length > COLS) {
        const partiallySplit = splitWords(copyArr);
        chat.push(partiallySplit.str);
        copyArr.splice(0, partiallySplit.ind);
      }
      chat.push(copyArr.join(' '));
    });
    while (chat.length > LINES) {
      chat.shift();
    }
    this.chatText?.setText(chat);
  }

  handleOpenClose() {
    this.open = !this.open;
    if (this.open) {
      this.counter = 0;
      this.newMessagesAmt.setText('');
      this.circle.setAlpha(0);
      this.wrapper
        .setScale(0.2)
        .setAlpha(0.5)
        .setTint(0xfbc82f)
        .setPosition(this.bntParams.x, this.bntParams.y)
        .setDepth(200);
      this.scene.tweens.add({
        targets: this.btn,
        scale: 2,
        ease: 'Linear',
        duration: 100,
      });
      this.scene.tweens.add({
        targets: this.wrapper,
        scale: 1,
        alpha: 1,
        ease: 'Sine.easeInOut',
        delay: 50,
        duration: 200,
        // tint: 0xe7f0f9,
        onComplete: () => {
          this.btn.setScale(0.7);
          this.wrapper.setTint();
        },
      });
      this.scene.tweens.add({
        targets: this.wrapper,
        x: this.wrapParams.x,
        y: this.wrapParams.y,
        ease: 'Sine.easeInOut',
        delay: 250,
        duration: 300,
        onComplete: () => {
          this.wrapper.setDepth(0);
          this.formHtml.setAlpha(1).setDepth(201);
          this.chatText.setAlpha(1).setDepth(202);
        },
      });
    } else {
      this.wrapper.setAlpha(0);
      this.formHtml.setAlpha(0);
      this.chatText.setAlpha(0);
    }
  }

  notify() {
    if (!this.open) {
      this.sound.play();
      this.counter++;
      this.circle.setAlpha(1);
      this.newMessagesAmt.setText(this.counter.toString());
    }
  }
}
