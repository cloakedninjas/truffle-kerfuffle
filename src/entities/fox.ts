import { GameObjects, Scene } from 'phaser';
import { Map } from './map';
import { FoxBehaviour, PatrolDestination } from "../lib/types";
import Tween = Phaser.Tweens.Tween;
import TimerEvent = Phaser.Time.TimerEvent;
import {
    FOX_ACTION_MAX_DELAY,
    FOX_ACTION_MIN_DELAY,
    FOX_CHANCE_LOOK,
    FOX_CHANCE_WAIT,
    FOX_WALK_SPEED,
    TILE_SIZE
} from "../config";
import { Game } from "../scenes/game";

export class Fox extends GameObjects.Sprite {
    scene: Game;
    velocity: Phaser.Types.Math.Vector2Like;
    private map: Map;
    behaviour: FoxBehaviour;
    actionTween: Tween;
    actionTimer: TimerEvent;

    constructor(scene: Scene, map: Map) {
        super(scene, 0, 0, 'fox_walk');

        this.map = map;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.setOrigin(0.5, 1);
        this.behaviour = 'patrolling';

        this.anims.create({
            key: 'walk',
            frameRate: 10,
            frames: this.anims.generateFrameNumbers('fox_walk', {
                frames: [0, 1, 2, 1, 0, 3, 4, 3]
            }),
            repeat: -1
        });

        this.queueAction();
    }

    update() {
        if (this.actionTween?.isPlaying()) {
            this.setDepth(this.y);
        }
    }

    queueAction() {
        this.actionTimer = this.scene.time.addEvent({
            delay: Phaser.Math.RND.between(FOX_ACTION_MIN_DELAY, FOX_ACTION_MAX_DELAY),
            callback: this.performAction,
            callbackScope: this
        });
    }

    performAction() {
        let rnd = Math.random();

        this.behaviour = 'patrolling';

        if (rnd < FOX_CHANCE_WAIT) {
            this.queueAction();
        } else {
            rnd -= FOX_CHANCE_WAIT;

            if (rnd < FOX_CHANCE_LOOK) {
                this.flipX = !this.flipX;
                this.queueAction();
            } else {
                const patrolDest = this.pickPatrolDestination();

                this.flipX = patrolDest.coord.x > this.x;

                this.play('walk');
                this.actionTween = this.scene.tweens.add({
                    duration: patrolDest.dist * FOX_WALK_SPEED,
                    targets: this,
                    x: patrolDest.coord.x,
                    y: patrolDest.coord.y,
                    onComplete: () => {
                        this.stop();
                        //this.play('idle') //TODO
                        this.queueAction();
                    }
                });
            }
        }
    }

    pickPatrolDestination(): PatrolDestination {
        let foundValidDest = false;
        let searchAttempts = 0;

        let dist;
        let x;
        let y;
        while (!foundValidDest) {
            const angle = Math.random() * (Math.PI * 2);
            dist = Phaser.Math.RND.between(3 * TILE_SIZE, 5 * TILE_SIZE);

            x = this.x + (Math.cos(angle) * dist);
            y = this.y + (Math.sin(angle) * dist);

            if (x > 0 && y > 0 &&
                x < this.map.tilemap.widthInPixels && y < this.map.tilemap.heightInPixels
            ) {
                if (!this.map.pathIntersectsWithCollision(this, { x, y })) {
                    foundValidDest = true;
                }
            }

            searchAttempts++;

            if (searchAttempts > 10) {
                // ensure we don't get stuck in a loop
                foundValidDest = true;
                x = this.x;
                y = this.y;
                dist = 0;
            }
        }

        return {
            coord: {
                x,
                y
            },
            dist
        };
    }

    /*move(dir: Direction) {
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
    }*/
}
