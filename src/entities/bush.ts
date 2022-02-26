import { GameObjects, Scene } from 'phaser';

export class Bush extends GameObjects.Sprite {
    constructor(scene: Scene, texture: string) {
        super(scene, 0, 0, texture);
    }

    setPigInside() {
        this.setTexture('bush_pig');
    }

    setPigOutisde() {
        this.setTexture('bush');
    }
}
