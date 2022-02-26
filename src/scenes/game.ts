import { Scene } from 'phaser';
import { Map } from "../entities/map";
import { Pig } from "../entities/pig";

export class Game extends Scene {
  private map: Map;
  private pig: Pig;

  constructor() {
    super({
      key: 'GameScene'
    });
  }

  create(): void {
    this.map = new Map(this);

    this.spawnPig();
    this.setupCameraControls();

    // debug
    window['game'] = this;
    window['map'] = this.map;
  }

  spawnPig() {
    this.pig = new Pig(this);
    this.add.existing(this.pig);
    this.pig.setPosition(128, 128);
  }

  private setupCameraControls(): void {
    this.cameras.main.setBounds(0, 0, this.map.tilemap.widthInPixels, this.map.tilemap.heightInPixels);
    //this.cameras.main.startFollow(this.player);
  }
}
