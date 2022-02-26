import { Scene } from 'phaser';
import Sprite = Phaser.GameObjects.Sprite;
import { TILE_SIZE, TOTAL_TRUFFLE } from "../config";
import Tile = Phaser.Tilemaps.Tile;
import { TruffleSpawner } from "./truffle-spawner";
import { Pig } from "./pig";
import { Shack } from "./shack";
import { Bush } from "./bush";
import { Game } from "../scenes/game";

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
        const grassTiles = this.tilemap.addTilesetImage('Grass', 'grass');
        //const trees = this.tilemap.addTilesetImage('trees', 'tree_set');
        //const hills = this.tilemap.addTilesetImage('Hills', 'hills');

        // layers
        this.tilemap.createLayer(`ground`, [grassTiles]);
        //const clutterLayer = this.tilemap.createLayer(`clutter`, [trees, hills]);
        this.collisionLayer = this.tilemap.createLayer('collision', []);

        // world objects
        this.worldObjects = this.tilemap.createFromObjects('objects', [
            {
                gid: 152,
                key: 'bush',
                // @ts-ignore
                classType: Bush
            },
            {
                gid: 153,
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
            sprite.setDepth(sprite.y + sprite.height);
        });

        // spawn truffles
        const fungiLayer = this.tilemap.createLayer('fungi', []);
        const spawnLocations: Phaser.Types.Math.Vector2Like[] = [];

        fungiLayer.tilemap.forEachTile((tile: Tile) => {
            if (tile.index !== -1) {
                spawnLocations.push(tile);
            }
        });

        this.truffleSpawners = [];

        for (let i = 0; i < TOTAL_TRUFFLE; i++) {
            const spawnIndex = Math.floor(Math.random() * spawnLocations.length);
            const tile = spawnLocations[spawnIndex];

            this.truffleSpawners.push(new TruffleSpawner(this.scene, this, tile));
            spawnLocations.splice(spawnIndex, 1);
        }
    }

    checkWorldObjects() {
        let actionEnabled = false;

        this.worldObjects.forEach((obj: Sprite) => {
            if (obj.getBounds().contains(this.pig.x, this.pig.y)) {
                obj.alpha = 0.5;
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
                        this.scene.actionButton.setAction('hide');
                    } else if (this.pig.truffleCount > 0) {
                        actionEnabled = true;
                        this.scene.actionButton.setAction('deposit');
                    }
                }
            }
        });

        if (!actionEnabled) {
            // can sniff?
            this.scene.actionButton.setAction(null);
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
