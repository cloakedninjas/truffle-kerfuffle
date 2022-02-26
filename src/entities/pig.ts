import { GameObjects, Scene } from 'phaser';

export class Pig extends GameObjects.Sprite {
    constructor(scene: Scene) {
        super(scene, 0, 0, 'piggy');

        this.setOrigin(0.5, 1);
    }
}
