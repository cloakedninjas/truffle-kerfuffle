import { GameObjects, Scene } from 'phaser';
import { Map } from "./map";
import { Direction } from "../lib/types";
import { PIG_BASE_SPEED } from "../config";

export class Pig extends GameObjects.Sprite {
    public velocity: Phaser.Types.Math.Vector2Like;
    private map: Map;
    truffleCount: number;
    isHiding: boolean;

    constructor(scene: Scene, map: Map) {
        super(scene, 0, 0, 'pig_walk');

        this.map = map;
        this.velocity  = {
            x: 0,
            y: 0
        };
        this.truffleCount = 0;
        this.isHiding = false;
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
                this.map.checkWorldObjects();
            }
        }
    }

    move(dir: Direction) {
        if (this.isHiding) {
            return;
        }

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

    hide() {
        this.visible = false;
        this.isHiding = true;
    }

    reveal() {
        this.visible = true;
        this.isHiding = false;
    }
}
