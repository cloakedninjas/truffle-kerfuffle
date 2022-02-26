import { GameObjects, Scene } from 'phaser';

export class Shack extends GameObjects.Sprite {
    constructor(scene: Scene, texture: string) {
        super(scene, 0, 0, texture);
    }
}
