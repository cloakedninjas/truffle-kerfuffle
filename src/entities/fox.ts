import { GameObjects, Scene } from 'phaser';
import { Map } from './map';
import { FoxBehaviour, MoveLocation } from "../lib/types";
import Tween = Phaser.Tweens.Tween;
import TimerEvent = Phaser.Time.TimerEvent;
import {
    FOX_ACTION_MAX_DELAY,
    FOX_ACTION_MIN_DELAY, FOX_CAUGHT_DISTANCE_SQ,
    FOX_CHANCE_LOOK,
    FOX_CHANCE_WAIT, FOX_DETECTION_DELAY, FOX_DETECTION_DISTANCE, FOX_LOSE_SIGHT_DISTANCE, FOX_RUN_SPEED,
    FOX_WALK_SPEED,
    TILE_SIZE
} from "../config";
import { Game } from "../scenes/game";
import { Pig } from "./pig";
import { Smoke } from "./smoke";

export class Fox extends GameObjects.Sprite {
    scene: Game;
    velocity: Phaser.Types.Math.Vector2Like;
    behaviour: FoxBehaviour;
    actionTween: Tween;
    actionTimer: TimerEvent;
    private map: Map;
    private pig: Pig;
    private detectionDelay: Phaser.Time.TimerEvent;
    private smoke: Smoke;

    constructor(scene: Scene, map: Map, pig: Pig) {
        super(scene, 0, 0, 'fox_walk');

        this.map = map;
        this.pig = pig;

        this.velocity = {
            x: 0,
            y: 0
        };
        this.setOrigin(0.5, 1);
        this.behaviour = 'patrolling';

        this.smoke = new Smoke(this.scene, this.x, this.y);

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('fox_walk', {frames: [0]})
        });

        this.anims.create({
            key: 'walk',
            frameRate: 10,
            frames: this.anims.generateFrameNumbers('fox_walk', {
                frames: [0, 1, 2, 1, 0, 3, 4, 3]
            }),
            repeat: -1
        });

        this.queueAction();

        this.detectionDelay = scene.time.addEvent({
            delay: FOX_DETECTION_DELAY,
            repeat: -1,
            callback: () => {
                if (this.pig.isHiding) {
                    return;
                }

                const distance = Phaser.Math.Distance.Between(this.x, this.y, pig.x, pig.y);

                if (this.behaviour === 'chasing' && distance > FOX_LOSE_SIGHT_DISTANCE) {
                    this.lostSightOfPig();
                } else if (this.behaviour === 'patrolling' && distance < FOX_DETECTION_DISTANCE) {
                    this.chasePig();
                }
            }
        })
    }

    update(delta: number) {
        if (this.actionTween?.isPlaying()) {
            this.setDepth(this.y);
        }

        if (this.behaviour === 'chasing') {
            this.setChaseVelocity();

            if (this.velocity.y) {
                this.setDepth(this.y);
            }

            this.x += (this.velocity.x * delta);
            this.y += (this.velocity.y * delta);
        }
    }

    queueAction(immediate?: boolean) {
        if (immediate) {
            this.performAction();
        } else {
            this.actionTimer = this.scene.time.addEvent({
                delay: Phaser.Math.RND.between(FOX_ACTION_MIN_DELAY, FOX_ACTION_MAX_DELAY),
                callback: this.performAction,
                callbackScope: this
            });
        }
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
                this.moveToLocation(patrolDest);
            }
        }
    }

    pickPatrolDestination(): MoveLocation {
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
                if (!this.map.pathIntersectsWithCollision(this, {x, y})) {
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

    moveToLocation(location: MoveLocation) {
        this.flipX = location.coord.x > this.x;

        this.play('walk');
        this.actionTween = this.scene.tweens.add({
            duration: location.dist * FOX_WALK_SPEED,
            targets: this,
            x: location.coord.x,
            y: location.coord.y,
            onComplete: () => {
                this.stop();
                this.play('idle')
                this.queueAction();
            }
        });
    }

    chasePig() {
        this.behaviour = 'chasing';

        this.actionTween?.stop();
        this.actionTimer?.destroy();

        this.setChaseVelocity();
    }

    lostSightOfPig() {
        this.behaviour = 'patrolling';
        this.play('idle');
        this.queueAction(true);
    }

    caughtPig() {
        this.behaviour = 'patrolling';
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.play('idle');

        this.smoke.show(this);
        this.pig.caught();

        this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                this.respawn();
            }
        })
    }

    private setChaseVelocity() {
        this.velocity.x = (this.x - this.pig.x < 1) ? FOX_RUN_SPEED : -FOX_RUN_SPEED;
        this.velocity.y = (this.y - this.pig.y < 1) ? FOX_RUN_SPEED : -FOX_RUN_SPEED;

        this.flipX = this.velocity.x > 0;

        if (Phaser.Math.Distance.BetweenPointsSquared(this, this.pig) < FOX_CAUGHT_DISTANCE_SQ) {
            this.caughtPig()
        }
    }

    private respawn() {
        this.smoke.hide();
        this.x = 1000;
        this.y = 1000;

        this.queueAction();
    }
}
