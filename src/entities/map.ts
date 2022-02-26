import { OBJECT_TRANS_ALPHA, TILE_SIZE, TOTAL_TRUFFLE } from "../config";
import { TruffleSpawner } from "./truffle-spawner";
import { Pig } from "./pig";
import { Shack } from "./shack";
import { Bush } from "./bush";
import { Game } from "../scenes/game";
import Sprite = Phaser.GameObjects.Sprite;
import Tile = Phaser.Tilemaps.Tile;

export class Map {
    scene: Game;
    tilemap: Phaser.Tilemaps.Tilemap;
    collisionLayer: Phaser.Tilemaps.TilemapLayer;
    truffleSpawners: TruffleSpawner[]
    pig: Pig;
    private worldObjects: Phaser.GameObjects.GameObject[];

    constructor(scene: Game) {
        this.scene = scene;

        this.tilemap = this.scene.make.tilemap({
            key: 'map'
        });

        // tilesets
        const tiles = this.tilemap.addTilesetImage('tiles', 'tiles');

        // layers
        this.tilemap.createLayer('ground', tiles);
        //const clutterLayer = this.tilemap.createLayer(`clutter`, [trees, hills]);
        this.collisionLayer = this.tilemap.createLayer('collision', tiles); // TODO hide tiles

        // world objects
        this.worldObjects = this.tilemap.createFromObjects('objects', [
            {
                gid: 1,
                key: 'bush',
                // @ts-ignore
                classType: Bush
            },
            {
                gid: 2,
                key: 'tree'
            },
            {
                gid: 154,
                key: 'shack',
                // @ts-ignore
                classType: Shack
            }
        ]);

        this.worldObjects.forEach((sprite: Sprite) => {
            // revert Phaser positioning
            sprite.y = (sprite.height * sprite.originY) + sprite.y;
            sprite.setOrigin(0.5, 1);
            sprite.setDepth(sprite.y);
        });

        // spawn truffles
        const fungiLayer = this.tilemap.createLayer('fungi', []);
        const spawnLocations: Phaser.Types.Math.Vector2Like[] = [];

        fungiLayer.tilemap.forEachTile((tile: Tile) => {
            if (tile.index !== -1) {
                spawnLocations.push(tile);
            }
        });

        if (spawnLocations.length) {
            this.truffleSpawners = [];

            for (let i = 0; i < TOTAL_TRUFFLE; i++) {
                const spawnIndex = Math.floor(Math.random() * spawnLocations.length);
                const tile = spawnLocations[spawnIndex];

                this.truffleSpawners.push(new TruffleSpawner(this.scene, this, tile, 3)); // TODO randomise
                spawnLocations.splice(spawnIndex, 1);
            }
        }
    }

    checkWorldObjects() {
        if (this.pig.isHiding) {
            return;
        }

        let actionEnabled = false;

        this.worldObjects.forEach((obj: Sprite) => {
            if (obj.getBounds().contains(this.pig.x, this.pig.y)) {
                obj.alpha = OBJECT_TRANS_ALPHA;
            } else {
                obj.alpha = 1;
            }

            if (obj instanceof Bush || obj instanceof Shack) {
                const catchmentArea = obj.getBounds();
                catchmentArea.x -= TILE_SIZE;
                catchmentArea.y -= TILE_SIZE;
                catchmentArea.width += (TILE_SIZE * 2);
                catchmentArea.height += (TILE_SIZE * 2);

                if (catchmentArea.contains(this.pig.x, this.pig.y)) {
                    if (obj instanceof Bush) {
                        actionEnabled = true;
                        this.scene.actionButton.setAction('hide', obj);
                    } else if (this.pig.truffleCount > 0) {
                        actionEnabled = true;
                        this.scene.actionButton.setAction('deposit', obj);
                    }
                }
            }
        });

        if (!actionEnabled) {
            this.scene.actionButton.setAction('sniff');
        }
    }

    isPositionWalkable(position: Phaser.Types.Math.Vector2Like): boolean {
        const tile = this.pxToTileCoord(position);
        return this.collisionLayer.getTileAt(tile.x, tile.y) === null;
    }

    pxToTileCoord(position: Phaser.Types.Math.Vector2Like) {
        return {
            x: Math.floor(position.x / TILE_SIZE),
            y: Math.floor(position.y / TILE_SIZE)
        };
    }

    tileToPxCoord(position: Phaser.Types.Math.Vector2Like) {
        return {
            x: position.x * TILE_SIZE,
            y: position.y * TILE_SIZE
        };
    }
}
