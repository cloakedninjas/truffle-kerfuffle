import { GameObjects, Scene } from 'phaser';
import { Map } from "./map";
import { ScentCloud } from "./scent-cloud";
import { Truffle } from "./truffle";

export class TruffleSpawner extends GameObjects.Sprite {
    private map: Map;

    tileCoord: Phaser.Types.Math.Vector2Like;
    scentCloud: ScentCloud;
    private spawnQty: number;

    constructor(scene: Scene, map: Map, position: Phaser.Types.Math.Vector2Like, spawnQty: number) {
        super(scene, 0, 0, 'truffle');

        this.tileCoord = position;
        this.map = map;
        this.spawnQty = spawnQty;

        const pxPos = this.map.tileToPxCoord(position);
        this.x = pxPos.x;
        this.y = pxPos.y;
        this.alpha = 0.5;
        this.setOrigin(0.5, 0.5);

        scene.add.existing(this);
    }

    spawnCloud() {
        this.scentCloud = new ScentCloud(this.scene, this.x, this.y);
    }

    excavate() {
        this.scentCloud.destroy();

        for (let i = 0; i < this.spawnQty; i++) {
            new Truffle(this.scene, this.x, this.y);
        }
    }
}
