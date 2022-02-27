import { Scene } from 'phaser';
import { Map } from '../entities/map';
import { Pig } from '../entities/pig';
import { Direction, ScoreParams, TruffleDistance } from '../lib/types';
import { ActionButton } from '../entities/action-button';
import {
    MAX_SNIFF_AMOUNT,
    MIN_DIG_DISTANCE,
    MIN_SNIFF_SHRINK_DISTANCE,
    OBJECT_TRANS_ALPHA,
    TOTAL_TRUFFLES,
    UI_DEPTH
} from "../config";
import { TruffleSpawner } from "../entities/truffle-spawner";
import { Truffle } from "../entities/truffle";
import { Fox } from "../entities/fox";
import Sprite = Phaser.GameObjects.Sprite;

export class Game extends Scene {
    map: Map;
    private pig: Pig;
    private fox: Fox;
    private nearestTruffleSpawner: TruffleSpawner;
    score: ScoreParams;
    actionButton: ActionButton;
    private lives: Phaser.GameObjects.Sprite[];
    private truffleCounter: Phaser.GameObjects.Sprite;
    private truffleCounterText: Phaser.GameObjects.Text;

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

        this.cameras.main.roundPixels = false;

        this.spawnPig();
        this.spawnFox();
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
        this.fox.update(delta);
    }

    spawnPig() {
        this.pig = new Pig(this, this.map);
        this.add.existing(this.pig);
        this.pig.setPosition(971, 1132);
        this.map.pig = this.pig;
    }

    spawnFox() {
        this.fox = new Fox(this, this.map, this.pig);
        this.add.existing(this.fox);
        this.fox.setPosition(256, 340);
        this.fox.setDepth(this.fox.y);
        this.map.fox = this.fox;
    }

    registerTruffle(truffle: Truffle) {
        this.map.truffles.push(truffle);
        this.add.existing(truffle);
    }

    registerTruffleCollected(truffle: Truffle) {
        this.sound.play(`collect${Phaser.Math.RND.between(1, 4)}`);
        this.score.trufflesCollected++;
        this.truffleCounterText.text = this.score.trufflesCollected.toString() + ' / ' + TOTAL_TRUFFLES;
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

        const uiY = 50;
        this.lives = [
            new Sprite(this, 950, uiY, 'lives', 0),
            new Sprite(this, 875, uiY, 'lives', 0),
            new Sprite(this, 800, uiY, 'lives', 0)
        ];

        this.lives.forEach(life => {
            life.setScrollFactor(0);
            life.setDepth(UI_DEPTH);
            this.add.existing(life);
        });

        this.truffleCounter = this.add.sprite(950, 120, 'truffle_counter');
        this.truffleCounter.setScrollFactor(0);
        this.truffleCounter.setDepth(UI_DEPTH);

        this.truffleCounterText = this.add.text(950, 100, '0 / ' + TOTAL_TRUFFLES, {
            color: '#fff',
            fontFamily: 'arial, sans-serif',
            fontSize: '16px',
            fontStyle: 'bold'
        });
        this.truffleCounterText.setOrigin(0.5, 0);
        this.truffleCounterText.setScrollFactor(0);
        this.truffleCounterText.setDepth(UI_DEPTH);
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
                this.fox.lostSightOfPig();
                bush = this.map.nearestBush;

                bush.setPigInside();
                bush.alpha = 1;
                break;

            case 'reveal':
                this.pig.reveal();
                bush = this.map.nearestBush;
                bush.setPigOutisde();

                if (bush.getBounds().contains(this.pig.x, this.pig.y)) {
                    bush.alpha = OBJECT_TRANS_ALPHA;
                }
                break;

            case 'sniff':
                this.pig.sniff();
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
                this.nearestTruffleSpawner.excavate();
                this.pig.dig();
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
                    this.pig.canDig = true;
                    this.nearestTruffleSpawner = truffle;
                }
            }
            truffle.scentCloud.refresh();
        } else {
            truffle.spawnCloud();
        }
    }

    loseLife() {
        this.lives[this.pig.health].setFrame(1);
    }

    gameOver() {
        this.scene.start('ScoreScene', this.score);
    }
}
