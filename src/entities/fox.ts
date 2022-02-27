import { GameObjects, Scene } from 'phaser';
import { Map } from './map';
import { FoxBehaviour } from "../lib/types";
import Tween = Phaser.Tweens.Tween;
import TimerEvent = Phaser.Time.TimerEvent;
import { FOX_ACTION_MAX_DELAY, FOX_ACTION_MIN_DELAY, FOX_CHANCE_LOOK, FOX_CHANCE_WAIT } from "../config";

export class Fox extends GameObjects.Sprite {
    public velocity: Phaser.Types.Math.Vector2Like;
    private map: Map;
    behaviour: FoxBehaviour;
    actionTween: Tween;
    actionTimer: TimerEvent;

    constructor(scene: Scene, map: Map) {
        super(scene, 0, 0, 'fox_walk');

        this.map = map;
        this.velocity  = {
            x: 0,
            y: 0
        };
        this.setOrigin(0.5, 1);
        this.behaviour = 'patrolling';

        this.anims.create({
            key: 'walk',
            frameRate: 10,
            frames: this.anims.generateFrameNumbers('fox_walk', { frames: [0, 1, 2, 1, 0, 3, 4, 3] }),
            repeat: -1
        });

        this.queueAction();
    }

    /*update(delta: number) {
        //
    }*/

    queueAction() {
        this.actionTimer = this.scene.time.addEvent({
            delay: Phaser.Math.RND.between(FOX_ACTION_MIN_DELAY, FOX_ACTION_MAX_DELAY),
            callback: this.performAction,
            callbackScope: this
        });
    }

    performAction() {
        let rnd = Math.random();

        if (rnd < FOX_CHANCE_WAIT) {
            this.queueAction();
        } else {
            rnd -= FOX_CHANCE_WAIT;

            if (rnd < FOX_CHANCE_LOOK) {
                this.flipX = !this.flipX;
                this.queueAction();
            } else {
                //console.log('walk');
                this.queueAction();
            }
        }
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
