import { Scene } from 'phaser';
import Sprite = Phaser.GameObjects.Sprite;

export class Map {
    scene: Scene;
    tilemap: Phaser.Tilemaps.Tilemap;

    constructor(scene: Scene) {
        this.scene = scene;

        this.tilemap = this.scene.make.tilemap({
            key: 'map'
        });

        // tilesets
        const grassTiles = this.tilemap.addTilesetImage('Grass', 'grass');
        const trees = this.tilemap.addTilesetImage('trees', 'tree_set');
        const hills = this.tilemap.addTilesetImage('Hills', 'hills');

        // layers
        const groundLayer = this.tilemap.createLayer(`ground`, [grassTiles]);
        //const clutterLayer = this.tilemap.createLayer(`clutter`, [trees, hills]);

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


        /*mapLayer.layer.data.forEach(row => {
            row.forEach(tile => {
                //tile.alpha = 0;
            });
        });*/
    }

    isWalkableTile(pos: Phaser.Types.Math.Vector2Like): boolean {
        if (this.isEdgeTile(pos)) {
            return false;
        }

        const tile = this.tilemap.getTileAt(pos.x, pos.y);
        //return CELL_WALKABLE.includes(tile.index);
        return true;
    }

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
    }
}
