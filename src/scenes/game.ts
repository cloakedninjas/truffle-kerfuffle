import { Scene } from 'phaser';
import { Map } from '../entities/map';
import { Pig } from '../entities/pig';
import { Direction } from '../lib/types';
import { ActionButton } from '../entities/action-button';
import { Bush } from "../entities/bush";

export class Game extends Scene {
    private map: Map;
    private pig: Pig;

    actionButton: ActionButton;

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    create(): void {
        this.map = new Map(this);

        this.spawnPig();
        this.setupUI();
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
        this.map.pig = this.pig;
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

        wasd['W'].on('up', () => this.pig.stopMove('n'));
        wasd['A'].on('up', () => this.pig.stopMove('w'));
        wasd['S'].on('up', () => this.pig.stopMove('s'));
        wasd['D'].on('up', () => this.pig.stopMove('e'));

        cursors.space.on('down', () => this.performAction());
        this.actionButton.on('pointerdown', () => this.performAction());
    }

    private setupUI() {
        this.actionButton = new ActionButton(this);
    }

    private handleDirPress(dir: Direction) {
        this.pig.move(dir);
    }

    private performAction() {
        if (this.actionButton.visible) {
            switch (this.actionButton.action) {
                case 'hide':
                    this.pig.hide();
                    (this.actionButton.activeObject as Bush).setPigInside();
                    this.actionButton.setAction('reveal', this.actionButton.activeObject);
                    break;

                case 'reveal':
                    this.pig.reveal();
                    (this.actionButton.activeObject as Bush).setPigOutisde();
                    this.actionButton.setAction('hide', this.actionButton.activeObject);
                    break;
            }
        }
    }
}
