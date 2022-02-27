import { Scene } from 'phaser';
import { INTERACTIVE, ScoreParams } from "../lib/types";
import { TOTAL_TRUFFLES } from "../config";

export default class Score extends Scene {
  private score: ScoreParams;
  constructor() {
    super({
      key: 'ScoreScene'
    });
  }

  init(data: ScoreParams): void {
    this.score = data;
  }

  create(): void {
    let bg;

    if (this.score.trufflesCollected === TOTAL_TRUFFLES) {
      bg = 'end_screen';
    } else {
      bg = 'end_screen2';
    }

    const bgImg = this.add.sprite(0, 0, bg);
    bgImg.setOrigin(0, 0);


    if (this.score.trufflesCollected === TOTAL_TRUFFLES) {
      this.score.time /= 1000;
      const mins = Math.floor(this.score.time / 60);
      const secs = Math.floor(this.score.time % 60);

      const timeTaken = `${mins}m ${secs}s`;

      const text = this.add.text(512, 400, timeTaken, {
        color: '#fff',
        fontFamily: 'arial, sans-serif',
        fontSize: '32px'
      });

      text.setOrigin(0.5, 0);
    }

    const playButton = this.add.rectangle(393, 630, 240, 65);
    playButton.setInteractive(INTERACTIVE);
    playButton.setOrigin(0, 0);
    playButton.on('pointerdown', () => this.scene.start('GameScene'));
  }

}
