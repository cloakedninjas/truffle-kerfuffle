import { GameObjects, Scene } from 'phaser';
import { Map } from './map';
import { Direction } from '../lib/types';
import { DIG_DURATION, FRAMERATE, PIG_BASE_SPEED } from '../config';
import Animation = Phaser.Animations.Animation;
import { Game } from "../scenes/game";

export class Pig extends GameObjects.Sprite {
    scene: Game;
    public velocity: Phaser.Types.Math.Vector2Like;
    private map: Map;
    truffleCount: number;
    canHide: boolean;
    canDeposit: boolean;
    canDig: boolean;
    isHiding: boolean;
    isDigging: boolean;
    isWalking: boolean;
    moveDir: Record<Direction, boolean>;

    constructor(scene: Scene, map: Map) {
        super(scene, 0, 0, 'pig');

        this.map = map;
        this.velocity  = {
            x: 0,
            y: 0
        };
        this.truffleCount = 0;
        this.canHide = false;
        this.canDeposit = false;
        this.canDig = false;
        this.isHiding = false;
        this.isWalking = false;
        this.moveDir = {
            n: false,
            s: false,
            e: false,
            w: false
        };
        this.setOrigin(0.5, 1);

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('pig', { frames: [0] })
        });

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

        this.on('animationcomplete', (anim: Animation) => {
            if (anim.key === 'sniff') {
                this.play('idle');
            }
        }, this);

    }

    update(delta: number) {
        this.isWalking = false;

        this.velocity.x = 0;
        this.velocity.y = 0;

        if (this.moveDir.n) {
            this.velocity.y = -PIG_BASE_SPEED;
            this.isWalking = true;
        } else if (this.moveDir.s) {
            this.velocity.y = PIG_BASE_SPEED;
            this.isWalking = true;
        }

        if (this.moveDir.e) {
            this.velocity.x = PIG_BASE_SPEED;
            this.flipX = true;
            this.isWalking = true;
        } else if (this.moveDir.w) {
            this.velocity.x = -PIG_BASE_SPEED;
            this.flipX = false;
            this.isWalking = true;
        }

        const walkAnimationPlaying = this.anims.isPlaying && this.anims.currentAnim?.key === 'walk';

        if (this.isWalking && !walkAnimationPlaying) {
            this.play('walk');
        } else if (!this.isWalking && walkAnimationPlaying) {
            this.play('idle');
        }

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

        if (this.isHiding) {
            this.scene.actionButton.setAction('reveal');
            return;
        }

        if (this.canHide) {
            this.scene.actionButton.setAction('hide');
            return;
        }

        if (!this.isWalking) {
            if (this.canDig) {
                this.scene.actionButton.setAction('dig');
            } else {
                this.scene.actionButton.setAction('sniff');
            }
        } else if (this.isWalking && this.scene.actionButton.action === 'sniff') {
            this.scene.actionButton.setAction(null);
        }
    }

    move(dir: Direction) {
        if (this.isHiding || this.isDigging) {
            return;
        }

        this.moveDir[dir] = true;
    }

    stopMove(dir: Direction) {
        this.moveDir[dir] = false;
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
        if (this.isWalking) {
            return;
        }
        this.play('sniff');
    }

    dig() {
        this.canDig = false;
        this.isDigging = true;
        this.play('dig');

        this.scene.time.addEvent({
            delay: DIG_DURATION,
            callback: () => {
                this.play('idle');
                this.isDigging = false;
            }
        });
    }
}
