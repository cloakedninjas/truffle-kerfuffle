import { GameObjects } from 'phaser';
import { MAX_TRUFFLE_ERUPT_DISTANCE, MIN_TRUFFLE_ERUPT_DISTANCE } from "../config";
import { Game } from "../scenes/game";
import { Pig } from "./pig";

export class Truffle extends GameObjects.Sprite {
    collectable: boolean;
    scene: Game;

    constructor(scene: Game, x: number, y: number) {
        super(scene, x, y, `truffle${Phaser.Math.RND.between(1, 3)}`);

        this.setOrigin(0.5, 1);
        this.setScale(0);
        this.collectable = false;

        scene.registerTruffle(this);

        let xDist = Phaser.Math.RND.between(MIN_TRUFFLE_ERUPT_DISTANCE, MAX_TRUFFLE_ERUPT_DISTANCE);
        let yDist = Phaser.Math.RND.between(MIN_TRUFFLE_ERUPT_DISTANCE, MAX_TRUFFLE_ERUPT_DISTANCE);

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
            y: this.y + yDist,
            onComplete: () => {
                this.collectable = true;
            }
        });
    }

    collect(pig: Pig) {
        this.scene.registerTruffleCollected(this);
        this.scene.tweens.add({
            duration: 300,
            ease: Phaser.Math.Easing.Circular.In,
            targets: this,
            x: pig.x,
            y: pig.y,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
