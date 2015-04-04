/// <reference path="../Algorithms/Algorithms.ts" />
/// <reference path="../RenderQueue/RenderQueue.ts" />
/// <reference path="../Physics/BasicProperties.ts" />

module TameGame {
    /**
     * Renders a grid of sprites
     */
    export class TileMapRenderer {
        constructor(tiles: number[][], tileSize: Size) {
            var widthTiles  = Math.max.apply(null, tiles.map(row => row.length));
            var heightTiles = tiles.length;

            var minX        = (tileSize.width*widthTiles)/2.0;
            var minY        = (tileSize.height*heightTiles)/2.0;

            var halfWidth   = tileSize.width/2.0;
            var halfHeight  = tileSize.height/2.0;

            // Renders the tilemap
            var render = (queue: RenderQueue, cameraId: number, zIndex: number, center: ILocation, bounds?: BoundingBox) => {
                // Matrix that transforms 0,0 to the center of the tile map
                var matrix = rotateTranslateMatrix(center.angle, center.pos);

                // The region of the tile map to draw
                var minTileX = 0;
                var minTileY = 0;
                var maxTileX = widthTiles;
                var maxTileY = heightTiles;

                // If a bounding box is supplied, then clip the range that's rendered to the specified range
                if (bounds) {
                    // Get the bounding box as it applies to the tile map
                    var reverseMatrix   = rotateTranslateMatrix(-center.angle, { x: -center.pos.x, y: -center.pos.y });
                    var tileBounds      = transformBoundingBox(bounds, reverseMatrix);

                    minTileX = Math.floor(tileBounds.x/tileSize.width);
                    minTileY = Math.floor(tileBounds.y/tileSize.height);
                    maxTileX = Math.ceil((tileBounds.x+tileBounds.width)/tileSize.width);
                    maxTileY = Math.ceil((tileBounds.y+tileBounds.height)/tileSize.height);

                    if (minTileX < 0) { minTileX = 0; }
                    if (minTileY < 0) { minTileY = 0; }
                    if (maxTileX > widthTiles) { maxTileX = widthTiles; }
                    if (maxTileY > heightTiles) { maxTileY = heightTiles; }
                }

                // Render the tiles
                for (var y=minTileY; y<maxTileY; ++y) {
                    var ypos = minY + y*tileSize.height;

                    for (var x=minTileX; x < maxTileX; ++x) {
                        var xpos        = minX + x*tileSize.width;
                        var tileSprite  = tiles[y][x] || 0;

                        this.renderTile(queue, tileSprite, cameraId, zIndex, { x: xpos, y: ypos }, matrix);
                    }
                }
            }

            // Renders an individual tile
            var renderTile = (queue: RenderQueue, spriteNumber: number, cameraId: number, zIndex: number, center: Point2D, matrix: number[]) => {
                var pos: Quad = {
                    x1: -halfWidth+center.x, y1: halfHeight+center.y,
                    x2: halfWidth+center.x,  y2: halfHeight+center.y,
                    x3: -halfWidth+center.x, y3: -halfHeight+center.y,
                    x4: halfWidth+center.x,  y4: -halfHeight+center.y
                };
                queue.drawSprite(spriteNumber, cameraId, zIndex, pos, matrix);
            };

            this.render     = render;
            this.renderTile = renderTile;
        }

        /**
         * Renders this tilemap centered on a particular location. If the bounding box is specified, then
         * only part of the map will be rendered to improve performance.
         */
        render: (queue: RenderQueue, cameraId: number, zIndex: number, center: ILocation, bounds?: BoundingBox) => void;

        /**
         * Renders a tile in this map
         */
        renderTile: (queue: RenderQueue, spriteNumber: number, cameraId: number, zIndex: number, center: Point2D, matrix: number[]) => void;
    };
}
