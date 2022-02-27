import { GameObjects, Scene } from 'phaser';
import { Map } from './map';
import { Direction } from '../lib/types';
import { DIG_DURATION, FRAMERATE, PIG_BASE_SPEED } from '../config';

export class Pig extends GameObjects.Sprite {
    public velocity: Phaser.Types.Math.Vector2Like;
    private map: Map;
    truffleCount: number;
    isHiding: boolean;
    isDigging: boolean;

    constructor(scene: Scene, map: Map) {
        super(scene, 0, 0, 'pig');

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
            frameRate: FRAMERATE,
            frames: this.anims.generateFrameNumbers('pig', { frames: [0, 1, 2, 1, 0, 3, 4, 3] }),
            repeat: -1
        });

        this.anims.create({
            key: 'dig',
            frameRate: FRAMERATE,
            frames: this.anims.generateFrameNumbers('pig', { frames: [5, 6, 7, 8] }),
            repeat: 3
        });

        this.anims.create({
            key: 'sniff',
            frameRate: FRAMERATE,
            frames: this.anims.generateFrameNumbers('pig', { frames: [9, 10, 11, 10, 11, 10, 11] })
        });
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

    sniff() {
        this.play('sniff');
    }

    dig() {
        this.isDigging = true;
        this.play('dig');

        this.scene.time.addEvent({
            delay: DIG_DURATION,
            callback: () => {
                this.setFrame(0); // TODO
                this.isDigging = false;
            }
        });
    }
}
