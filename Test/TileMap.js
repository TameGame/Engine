QUnit.test("GenerateTileMapFromString", function(assert) {
    var generator = new TameGame.StringTileMapGenerator();

    generator.define('#', 1);
    generator.define('|', 2);
    generator.define('-', 3);

    var testMap = generator.createTileMap(
        [
            "#---#",
            "|# # ",
            "| #  ",
            "|# # ",
            "#   #"
        ]);

    assert.ok(testMap[0][0] === 1);
    assert.ok(testMap[2][2] === 1);
    assert.ok(testMap[2][1] === 0);
    assert.ok(testMap[2][0] === 2);
    assert.ok(testMap[0][2] === 3);
});

QUnit.test("RenderTileMap", function(assert) {
    var generator = new TameGame.StringTileMapGenerator();

    generator.define('#', 1);
    generator.define('|', 2);
    generator.define('-', 3);

    var testMap = generator.createTileMap(
        [
            "#---#",
            "|# # ",
            "| #  ",
            "|# # ",
            "#   #"
        ]);

    var renderer = new TameGame.TileMapRenderer(testMap, { width: 2, height: 1 });
    var renderQueue = new TameGame.StandardRenderQueue({ width: 100, height: 100 });

    function approxEquals(a, b) { return Math.abs(a-b) < 0.01; }

    var hitCenter   = false;
    var hitLeft     = false;
    var hitBottom   = false;
    renderer.renderTile = function(queue, spriteNumber, cameraId, zIndex, center, matrix) {
        console.log(spriteNumber, center);

        if (approxEquals(center.x, 0) && approxEquals(center.y, 0)) {
            hitCenter = true;
            assert.ok(spriteNumber === 1);
        }

        if (approxEquals(center.x, -4) && approxEquals(center.y, -1)) {
            assert.ok(spriteNumber === 2)
            hitLeft = true;
        }

        if (approxEquals(center.x, 4) && approxEquals(center.y, 2)) {
            assert.ok(spriteNumber === 1)
            hitBottom = true;
        }
    };

    renderer.render(renderQueue, 0, 0, { pos: { x: 0, y: 0 }, angle: 0 } );

    assert.ok(hitCenter);
    assert.ok(hitLeft);
    assert.ok(hitBottom);
});
