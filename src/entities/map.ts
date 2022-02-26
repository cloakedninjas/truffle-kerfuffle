import { Scene } from 'phaser';
import Sprite = Phaser.GameObjects.Sprite;
import { TILE_SIZE, TOTAL_TRUFFLE } from "../config";
import Tile = Phaser.Tilemaps.Tile;
import { TruffleSpawner } from "./truffle-spawner";

export class Map {
    scene: Scene;
    tilemap: Phaser.Tilemaps.Tilemap;
    collisionLayer: Phaser.Tilemaps.TilemapLayer;
    truffleSpawners: TruffleSpawner[]

    constructor(scene: Scene) {
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
        const objects = this.tilemap.createFromObjects('objects', [
            {
                gid: 152,
                key: 'tree_set'
            },
            {
                gid: 153,
                key: 'tree_set',
                frame: 1
            }
        ]);

        objects.forEach((sprite: Sprite) => {
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

        this.truffleSpawners = [];

        for (let i = 0; i < TOTAL_TRUFFLE; i++) {
            const spawnIndex = Math.floor(Math.random() * spawnLocations.length);
            const tile = spawnLocations[spawnIndex];

            this.truffleSpawners.push(new TruffleSpawner(this.scene, this, tile));
            spawnLocations.splice(spawnIndex, 1);
        }

        console.log(spawnLocations);
    }
/*
    isEdgeTile(pos: Phaser.Types.Math.Vector2Like): boolean {
        if (pos.x === 0 || pos.x === this.tilemap.width - 1) {
            return true;
        }

        if (pos.y === 0 || pos.y === this.tilemap.height - 1) {
            return true;
        }
    }

    getTileAt(position: Phaser.Types.Math.Vector2Like): Phaser.Tilemaps.Tile {
        return this.tilemap.getTileAt(position.x, position.y);
    }*/

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
