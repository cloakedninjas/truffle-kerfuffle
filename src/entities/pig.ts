import { GameObjects, Scene } from 'phaser';
import { Map } from './map';
import { Direction } from '../lib/types';
import { PIG_BASE_SPEED } from '../config';

export class Pig extends GameObjects.Sprite {
    public velocity: Phaser.Types.Math.Vector2Like;
    private map: Map;
    truffleCount: number;
    isHiding: boolean;
    isDigging: boolean;

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

        this.anims.create({
            key: 'walk',
            frameRate: 10,
            frames: this.anims.generateFrameNumbers('pig_walk', { frames: [0, 1, 2, 1, 0, 3, 4, 3] }),
            repeat: -1
        });

        this.on('animationcomplete', (animation: Phaser.Animations.Animation) => {
            console.log('anim complete');
            if (animation.key === 'dig') {
                this.isDigging = false;
                this.setFrame(0);
            }
        }, this);
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
        if (this.isHiding || this.isDigging) {
            return;
        }

        if (dir === 'n') {
            this.velocity.y = -PIG_BASE_SPEED;
        } else if (dir === 's') {
            this.velocity.y = PIG_BASE_SPEED;
        }

        if (dir === 'e') {
            this.velocity.x = PIG_BASE_SPEED;
            this.flipX = true;
        } else if (dir === 'w') {
            this.velocity.x = -PIG_BASE_SPEED;
            this.flipX = false;
        }

        this.play('walk');
    }

    stopMove(dir: Direction) {
        if (dir === 'n' || dir === 's') {
            this.velocity.y = 0
        } else {
            this.velocity.x = 0;
        }

        this.stop();
    }

    hide() {
        this.visible = false;
        this.isHiding = true;
    }

    reveal() {
        this.visible = true;
        this.isHiding = false;
    }

    dig() {
        /*this.isDigging = true;
        this.play({
            key: 'walk',
            repeat: 3
        });*/
    }
}
