import { Scene } from 'phaser';
import { TILE_SIZE } from '../config';

export class Tile {
    scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }
}