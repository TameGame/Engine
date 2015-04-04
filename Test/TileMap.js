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
    var hitRight    = false;
    renderer.renderTile = function(queue, spriteNumber, cameraId, zIndex, center, matrix) {
        if (approxEquals(center.x, 0) && approxEquals(center.y, 0)) {
            hitCenter = true;
            assert.ok(spriteNumber === 1, 'Center tile renders');

            assert.ok(cameraId === 1, 'Camera pass through');
            assert.ok(zIndex === 2, 'zIndex pass through');
        }

        if (approxEquals(center.x, -4) && approxEquals(center.y, -1)) {
            assert.ok(spriteNumber === 2, 'Tile at 0,1 renders')
            hitLeft = true;
        }

        if (approxEquals(center.x, 4) && approxEquals(center.y, 2)) {
            assert.ok(spriteNumber === 1, 'Tile at 4,4 renders')
            hitBottom = true;
        }

        if (approxEquals(center.x, 4) && approxEquals(center.y, 0)) {
            // As a space, this should be invisible and hence never render
            hitRight = true;
        }
    };

    renderer.render(renderQueue, 1, 2, { pos: { x: 0, y: 0 }, angle: 0 } );

    assert.ok(hitCenter);
    assert.ok(hitLeft);
    assert.ok(hitBottom);
    assert.ok(!hitRight);
});

QUnit.test("RenderPartialTileMap", function(assert) {
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
        assert.ok(approxEquals(center.x, 0) && approxEquals(center.y, 0), 'Only center tile rendered');
        hitCenter = true;
    };

    renderer.render(renderQueue, 1, 2, { pos: { x: 0, y: 0 }, angle: 0 }, { x: -0.5, y: -0.5, width: 0.5, height: 0.5 } );
    assert.ok(hitCenter, 'Actually rendered center tile');
});
