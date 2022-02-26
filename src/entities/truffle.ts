import { GameObjects, Scene } from 'phaser';
import { TILE_SIZE } from "../config";

export class Truffle extends GameObjects.Sprite {
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'truffle');

        this.setOrigin(0.5, 0.5);
        this.setScale(0);

        scene.add.existing(this);

        let xDist = Phaser.Math.RND.between(TILE_SIZE / 2, TILE_SIZE * 2);
        let yDist = Phaser.Math.RND.between(TILE_SIZE / 2, TILE_SIZE * 2);

        const tweenDuration = (xDist * 10) + (yDist * 10);
        const delay = Phaser.Math.RND.between(100, 300);

        if (Math.random() > 0.5) {
            xDist *= -1;
        }

        if (Math.random() > 0.5) {
            yDist *= -1;
        }

        scene.tweens.add({
            delay,
            duration: 300,
            ease: Phaser.Math.Easing.Sine.Out,
            targets: this,
            scale: 1
        });

        scene.tweens.add({
            delay,
            duration: tweenDuration,
            ease: Phaser.Math.Easing.Bounce.Out,
            targets: this,
            x: this.x + xDist,
            y: this.y + yDist
        });
    }

}
