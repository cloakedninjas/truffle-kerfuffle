import { GameObjects, Scene } from 'phaser';
import { SCENT_CLOUD_FADE_DELAY, SCENT_CLOUD_FADE_DURATION, TILE_SIZE } from "../config";

export class ScentCloud extends GameObjects.Sprite {
    private fadeout: Phaser.Tweens.Tween;
    private hasShrunk: boolean;
    private actualPosition: Phaser.Types.Math.Vector2Like;
    sniffCount: number;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, 0, 0, 'smell_zone');
        this.alpha = 0.7;
        this.setOrigin(0.5, 0.5);

        this.actualPosition = {
            x,
            y
        };
        this.sniffCount = 1;
        this.setRandomProps();
        scene.add.existing(this);

        this.addFadeout();
    }

    setRandomProps() {
        this.setRandomPosition();
        this.angle = Math.random() * 360;
    }

    addFadeout() {
        if (this.fadeout?.isPlaying()) {
            console.log('am playing, skip!');
            return;
        }
        this.fadeout = this.scene.tweens.add({
            delay: SCENT_CLOUD_FADE_DELAY,
            duration: SCENT_CLOUD_FADE_DURATION,
            targets: this,
            alpha: 0,
            onComplete: () => this.setRandomProps()
        });
    }

    setRandomPosition() {
        super.setRandomPosition(
            this.actualPosition.x - (this.width / 2),
            this.actualPosition.y - (this.height / 2),
            this.width,
            this.height);

        return this;
    }

    refresh() {
        if (this.hasShrunk) {
            this.setRandomProps();
            this.scale = 1;
            this.hasShrunk = false;
            this.sniffCount = 0;
        }

        this.sniffCount++
        this.alpha = 1;
        this.fadeout.restart();
    }

    shrink() {
        if (this.hasShrunk) {
            return;
        }
        this.fadeout.stop();
        this.alpha = 1;
        this.scale = 0.3;
        this.x = this.actualPosition.x;
        this.y = this.actualPosition.y;
        this.angle = Math.random() * 360;
        this.hasShrunk = true;
        this.addFadeout();
    }
}
