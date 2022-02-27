import { Scene } from 'phaser';
import { INTERACTIVE } from "../lib/types";

export default class Title extends Scene {
  constructor() {
    super({
      key: 'TitleScene'
    });
  }

  preload(): void {
    //
  }

  create(): void {
    const bg = this.add.sprite(0, 0, 'title_screen');
    bg.setOrigin(0, 0);

   // const playButton

    const playButton = this.add.rectangle(257, 39, 290, 270);
    playButton.setInteractive(INTERACTIVE);
    playButton.setOrigin(0, 0);
    playButton.on('pointerdown', () => this.scene.start('GameScene'));
  }

  creditClick() {

  }
}
