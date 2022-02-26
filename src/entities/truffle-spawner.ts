import { GameObjects, Scene } from 'phaser';
import { Map } from "./map";
import { ScentCloud } from "./scent-cloud";

export class TruffleSpawner extends GameObjects.Sprite {
    private map: Map;

    tileCoord: Phaser.Types.Math.Vector2Like;
    scentCloud: ScentCloud;

    constructor(scene: Scene, map: Map, position: Phaser.Types.Math.Vector2Like) {
        super(scene, 0, 0, 'truffle');

        this.tileCoord = position;
        this.map = map;

        const pxPos = this.map.tileToPxCoord(position);
        this.x = pxPos.x;
        this.y = pxPos.y;
        this.alpha = 0.5;

        scene.add.existing(this);
    }

    spawnCloud() {
        this.scentCloud = new ScentCloud(this.scene, this.x, this.y);
    }
}
