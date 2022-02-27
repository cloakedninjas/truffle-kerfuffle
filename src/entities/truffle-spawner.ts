import { GameObjects } from 'phaser';
import { Map } from "./map";
import { ScentCloud } from "./scent-cloud";
import { Truffle } from "./truffle";
import { Game } from "../scenes/game";

export class TruffleSpawner extends GameObjects.Sprite {
    private map: Map;
    scene: Game;
    tileCoord: Phaser.Types.Math.Vector2Like;
    scentCloud: ScentCloud;
    private spawnQty: number;

    constructor(scene: Game, map: Map, position: Phaser.Types.Math.Vector2Like, spawnQty: number) {
        super(scene, 0, 0, 'truffle');

        this.tileCoord = position;
        this.map = map;
        this.spawnQty = spawnQty;

        const pxPos = this.map.tileToPxCoord(position);
        this.x = pxPos.x;
        this.y = pxPos.y;
        this.visible = false;
        this.setOrigin(0.5, 0.5);

        scene.add.existing(this);
    }

    spawnCloud() {
        this.scentCloud = new ScentCloud(this.scene, this.x, this.y);
    }

    excavate() {
        this.scentCloud?.destroy();

        for (let i = 0; i < this.spawnQty; i++) {
            const delay = i * 100;
            this.scene.time.addEvent({
                delay,
                callback: () => {
                    const chimeI = i % 6;
                    const sound = this.scene.sound.add(`chime${chimeI + 1}`);
                    sound.play();

                    new Truffle(this.scene, this.x, this.y);
                }
            });
        }

        this.scene.time.addEvent({
            delay: this.spawnQty * 120,
            callback: () => {
                this.destroy();
            }
        });
    }
}
