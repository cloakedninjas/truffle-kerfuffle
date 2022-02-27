import { GameObjects } from 'phaser';
import { Game } from "../scenes/game";
import { Fox } from "./fox";

export class Smoke extends GameObjects.Sprite {
    scene: Game;

    constructor(scene: Game, x: number, y: number) {
        super(scene, x, y, 'fox_cloud');

        this.setOrigin(0.5, 0.5);

        this.anims.create({
            key: 'main',
            frameRate: 10,
            frames: this.anims.generateFrameNumbers('fox_cloud', { frames: [0, 1, 2, 3] }),
            repeat: -1
        });

        this.play('main');
        this.visible = false;
        scene.add.existing(this);
    }

    show(fox: Fox) {
        this.x = fox.x;
        this.y = fox.y - (fox.height / 2)
        this.visible = true;
        this.setDepth(this.y + 100);
    }

    hide() {
        this.visible = false;
    }
}
