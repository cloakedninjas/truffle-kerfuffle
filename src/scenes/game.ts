import { Scene } from 'phaser';
import { Map } from "../entities/map";
import { Pig } from "../entities/pig";
import { Direction } from "../lib/types";
import { PIG_BASE_SPEED } from "../config";

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
    this.setupKeyboardControls();

    // debug
    window['game'] = this;
    window['map'] = this.map;
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.pig.update(delta);
  }

  spawnPig() {
    this.pig = new Pig(this, this.map);
    this.add.existing(this.pig);
    this.pig.setPosition(128, 128);
  }

  private setupCameraControls(): void {
    this.cameras.main.setBounds(0, 0, this.map.tilemap.widthInPixels, this.map.tilemap.heightInPixels);
    this.cameras.main.startFollow(this.pig);
  }

  private setupKeyboardControls() {
    const cursors = this.input.keyboard.createCursorKeys();
    const wasd = this.input.keyboard.addKeys('W,S,A,D');

    cursors.up.on('down', () => this.handleDirPress('n'));
    cursors.right.on('down', () => this.handleDirPress('e'));
    cursors.down.on('down', () => this.handleDirPress('s'));
    cursors.left.on('down', () => this.handleDirPress('w'));

    cursors.up.on('up', () => this.pig.stopMove('n'));
    cursors.right.on('up', () => this.pig.stopMove('e'));
    cursors.down.on('up', () => this.pig.stopMove('s'));
    cursors.left.on('up', () => this.pig.stopMove('w'));

    wasd['W'].on('down', () => this.handleDirPress('n'));
    wasd['A'].on('down', () => this.handleDirPress('w'));
    wasd['S'].on('down', () => this.handleDirPress('s'));
    wasd['D'].on('down', () => this.handleDirPress('e'));

    //cursors.space.on('up', () => this.performAction());
  }

  private handleDirPress(dir: Direction) {
    this.pig.move(dir);
  }
}
