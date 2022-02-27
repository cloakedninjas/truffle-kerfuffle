import { Scene } from 'phaser';
import { Map } from '../entities/map';
import { Pig } from '../entities/pig';
import { Direction, TruffleDistance } from '../lib/types';
import { ActionButton } from '../entities/action-button';
import { Bush } from "../entities/bush";
import { MAX_SNIFF_AMOUNT, MIN_DIG_DISTANCE, MIN_SNIFF_SHRINK_DISTANCE, OBJECT_TRANS_ALPHA } from "../config";
import { TruffleSpawner } from "../entities/truffle-spawner";
import { Truffle } from "../entities/truffle";

export class Game extends Scene {
    private map: Map;
    private pig: Pig;
    private nearestTruffleSpawner: TruffleSpawner;
    private score: {
        trufflesCollected: number;
        time: number
    };
    actionButton: ActionButton;

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    create(): void {
        this.map = new Map(this);
        this.score = {
            trufflesCollected: 0,
            time: 0
        };

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

    registerTruffle(truffle: Truffle) {
        this.map.truffles.push(truffle);
        this.add.existing(truffle);
    }

    registerTruffleCollected(truffle: Truffle) {
        this.score.trufflesCollected++;
        this.map.truffles.splice(this.map.truffles.indexOf(truffle), 1);
    }

    removeSpawner(truffleSpawner: TruffleSpawner) {
        this.map.truffleSpawners.splice(this.map.truffleSpawners.indexOf(truffleSpawner), 1);
        this.nearestTruffleSpawner = null;
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
        this.actionButton.on(Phaser.Input.Events.POINTER_DOWN, () => this.performAction());
    }

    private setupUI() {
        this.actionButton = new ActionButton(this);
    }

    private handleDirPress(dir: Direction) {
        this.pig.move(dir);
    }

    private performAction() {
        if (!this.actionButton.visible) {
            return;
        }

        let bush;
        let closestTuffles: TruffleDistance[] = [];

        switch (this.actionButton.action) {
            case 'hide':
                this.pig.hide();
                bush = this.actionButton.activeObject as Bush;

                bush.setPigInside();
                bush.alpha = 1;
                this.actionButton.setAction('reveal', this.actionButton.activeObject);
                break;

            case 'reveal':
                this.pig.reveal();
                bush = this.actionButton.activeObject as Bush;
                bush.setPigOutisde();

                if (bush.getBounds().contains(this.pig.x, this.pig.y)) {
                    bush.alpha = OBJECT_TRANS_ALPHA;
                }

                this.actionButton.setAction('hide', this.actionButton.activeObject);
                break;

            case 'sniff':
                this.map.truffleSpawners.forEach(truffle => {
                    const distance = Phaser.Math.Distance.BetweenPointsSquared(truffle, this.pig);

                    closestTuffles.push({
                        truffle,
                        distance
                    });
                });

                closestTuffles = closestTuffles.sort((a, b) => a.distance > b.distance ? 1 : -1);
                closestTuffles = closestTuffles.slice(0, MAX_SNIFF_AMOUNT);
                closestTuffles.forEach(({ truffle }) => {
                    if (this.cameras.main.getBounds().contains(truffle.x, truffle.y)) {
                        this.spawnScentCloud(truffle);
                    }
                });

                break;

            case 'dig':
                this.actionButton.setAction(null);
                this.nearestTruffleSpawner.excavate();
                this.removeSpawner(this.nearestTruffleSpawner);

                break;
        }
    }

    private spawnScentCloud(truffle: TruffleSpawner) {
        if (truffle.scentCloud) {
            const distanceToTruffle = Phaser.Math.Distance.Between(this.pig.x, this.pig.y, truffle.x, truffle.y);

            if (truffle.scentCloud.sniffCount > 1 && distanceToTruffle < MIN_SNIFF_SHRINK_DISTANCE) {
                truffle.scentCloud.shrink();

                if (distanceToTruffle < MIN_DIG_DISTANCE) {
                    this.actionButton.setAction('dig');
                    this.nearestTruffleSpawner = truffle;
                }

                return;
            }
            truffle.scentCloud.refresh();
        } else {
            truffle.spawnCloud();
        }
    }
}
