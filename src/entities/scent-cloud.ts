import { GameObjects, Scene } from 'phaser';
import { SCENT_CLOUD_FADE_DELAY, SCENT_CLOUD_FADE_DURATION, TILE_SIZE } from "../config";
import { Game } from "../scenes/game";

export class ScentCloud extends GameObjects.Sprite {
    private fadeout: Phaser.Tweens.Tween;

    constructor(scene: Game, x: number, y: number) {
        super(scene, 0, 0, 'smell_zone');
        this.alpha = 0.7;
        this.setOrigin(0.5, 0.5);

        let randX = Phaser.Math.RND.between(TILE_SIZE, (this.width / 2));
        let randY = Phaser.Math.RND.between(TILE_SIZE, (this.height / 2));

        if (Math.random() > 0.5) {
            randX *= -1;
        }

        if (Math.random() > 0.5) {
            randY *= -1;
        }

        this.setPosition(randX + x, randY + y);
        scene.add.existing(this);

        this.fadeout = scene.tweens.add({
            delay: SCENT_CLOUD_FADE_DELAY,
            duration: SCENT_CLOUD_FADE_DURATION,
            targets: this,
            alpha: 0,
            onComplete: () => scene.removeScentCloud(this)
        });
    }

    refresh() {
        this.fadeout.restart();
    }
}
