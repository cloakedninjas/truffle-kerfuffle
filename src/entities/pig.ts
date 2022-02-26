import { GameObjects, Scene } from 'phaser';
import { Map } from "./map";
import { Direction } from "../lib/types";
import { PIG_BASE_SPEED } from "../config";

export class Pig extends GameObjects.Sprite {
    public velocity: Phaser.Types.Math.Vector2Like;
    private map: Map;

    constructor(scene: Scene, map: Map) {
        super(scene, 0, 0, 'piggy');

        this.map = map;
        this.velocity  = {
            x: 0,
            y: 0
        };
        this.setOrigin(0.5, 1);
    }

    update(delta: number) {
        if (this.velocity.x || this.velocity.y) {
            const newPosition = {
                x: this.x + (this.velocity.x * delta),
                y: this.y + (this.velocity.y * delta)
            };

            if (this.map.isPositionWalkable(newPosition)) {
                this.setPosition(newPosition.x, newPosition.y);
                this.setDepth(this.y);
                this.map.checkObjectVis(this);
            }
        }
    }

    move(dir: Direction) {
        if (dir === 'n') {
            this.velocity.y = -PIG_BASE_SPEED;
        } else if (dir === 's') {
            this.velocity.y = PIG_BASE_SPEED;
        }

        if (dir === 'e') {
            this.velocity.x = PIG_BASE_SPEED;
        } else if (dir === 'w') {
            this.velocity.x = -PIG_BASE_SPEED;
        }
    }

    stopMove(dir: Direction) {
        if (dir === 'n' || dir === 's') {
            this.velocity.y = 0
        } else {
            this.velocity.x = 0;
        }
    }
}
