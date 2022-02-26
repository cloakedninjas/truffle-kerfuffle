import { GameObjects, Scene } from 'phaser';

export class Truffle extends GameObjects.Sprite {
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'truffle');

        this.setOrigin(0.5, 0.5);

        scene.add.existing(this);
    }

}
