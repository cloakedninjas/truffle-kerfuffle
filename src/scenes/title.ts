import { Scene } from 'phaser';
import { INTERACTIVE } from "../lib/types";

export default class Title extends Scene {
  private music: Phaser.Sound.BaseSound;
  constructor() {
    super({
      key: 'TitleScene'
    });
  }

  create(): void {
    const bg = this.add.sprite(0, 0, 'title_screen');
    bg.setOrigin(0, 0);

   // const playButton

    const playButton = this.add.rectangle(257, 39, 290, 270);
    playButton.setInteractive(INTERACTIVE);
    playButton.setOrigin(0, 0);
    playButton.on('pointerdown', () => {
      this.sound.play('collect1');
      this.scene.start('GameScene');
      this.music.stop();
    });

    this.music = this.sound.add('title', {
      loop: true
    });

    this.music.play();
  }

  creditClick() {

  }
}
