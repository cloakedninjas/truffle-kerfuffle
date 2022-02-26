import { GameObjects, Scene } from 'phaser';
import { INTERACTIVE } from "../lib/types";

export class Button extends GameObjects.Sprite {
    constructor(scene: Scene, texture: string) {
        super(scene, 0, 0, texture);
        this.setOrigin(0.5, 0.5);
        this.setScrollFactor(0);
        this.setInteractive(INTERACTIVE);
    }
}
