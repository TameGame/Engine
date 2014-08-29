QUnit.test("QuadTreeCanAddObject", function (assert) {
    var tree    = new TameGame.QuadTree();
    var someRef = tree.addObject({ x: 0.5, y: 0.5, width: 0.25, height: 0.25 }, {});
    
    assert.ok(someRef !== null);
});


QUnit.test("QuadTreeCanRemoveObject", function (assert) {
    var tree    = new TameGame.QuadTree();
    var someRef = tree.addObject({ x: 0.5, y: 0.5, width: 0.25, height: 0.25 }, {});
    tree.removeObject(someRef);
    
    assert.ok(someRef !== null);
});

QUnit.test("QuadTreeCanFindObject", function (assert) {
    var tree    = new TameGame.QuadTree();
    var someRef = tree.addObject({ x: 0.5, y: 0.5, width: 0.25, height: 0.25 }, {});
    var count   = 0;
    
    tree.forAllInBounds({ x:0, y: 0, width: 1, height: 1 }, function (obj) { ++count });
    
    assert.ok(someRef !== null);
    assert.ok(count === 1);
});

QUnit.test("QuadTreeCanFindHugeObject", function (assert) {
    var tree    = new TameGame.QuadTree();
    var someRef = tree.addObject({ x: -100, y: -100, width: 200, height: 200 }, {});            // Forces the quadtree to expand outward
    var count   = 0;
    
    tree.forAllInBounds({ x:-2, y: -2, width: 4, height: 4 }, function (obj) { ++count });
    
    assert.ok(someRef !== null);
    assert.ok(count === 1);
});

QUnit.test("QuadTreeExcludeObjectOutOfBounds", function (assert) {
    var tree    = new TameGame.QuadTree();
    var someRef = tree.addObject({ x: 0.5, y: 0.5, width: 0.25, height: 0.25 }, {});
    var count   = 0;
    
    tree.forAllInBounds({ x:-1, y: -1, width: 1, height: 1 }, function (obj) { ++count });
    
    assert.ok(someRef !== null);
    assert.ok(count === 0);
});

// Populates a quadtree with a grid of objects from 0,0 to 1,1. Width, height indicate the number of cells in the appropriate dimension
function populateGrid(quadTree, width, height) {
    var distX = 1.0 / width;
    var distY = 1.0 / height;
    
    var xpos, ypos;
    var x,y;
    
    ypos = 0;
    for (y=0; y<height; ++y) {
        xpos = 0;
        for (x=0; x<width; ++x) {
            quadTree.addObject({ x: xpos, y: ypos, width: distX, height: distY }, { x: xpos, y: ypos });
            
            xpos += distX;
        }
        
        ypos += distY;
    }
}

QUnit.test("QuadTreeQuery100Objects", function (assert) {
    // Create a quadtree with 100 objects in it
    var tree = new TameGame.QuadTree();
    populateGrid(tree, 10, 10);
    var count = 0;
    
    // Should be 9 objects in a 3x3 square
    tree.forAllInBounds({ x:0, y:0, width:.3, height:.3 }, function () { ++count; });
    assert.ok(count === 9, "9 objects in 3x3 square");
    if (count !== 9) console.log('9 !== ', count);
    
    // Should be 100 objects overall
    count = 0;
    tree.forAllInBounds({ x: 0, y: 0, width:1, height: 1 }, function () { ++count; });
    assert.ok(count === 100, "100 objects overall");
    if (count !== 100) console.log('100 !== ', count);
});

QUnit.test("QuadTreeQuery100ObjectsExpandTree", function (assert) {
    // Create a quadtree with 100 objects in it
    var tree = new TameGame.QuadTree();
    populateGrid(tree, 10, 10);
    var count = 0;
    
    // Expand the tree with an object that won't appear in the result
    tree.addObject({ x: -2, y: -2, width: .5, height: .5 }, {});                // Shouldn't appear in the test; also expands a populated tree    
    
    // Should be 9 objects in a 3x3 square
    tree.forAllInBounds({ x:0, y:0, width:.3, height:.3 }, function () { ++count; });
    assert.ok(count === 9, "9 objects in 3x3 square");
    if (count !== 9) console.log('9 !== ', count);
    
    // Should be 100 objects overall
    count = 0;
    tree.forAllInBounds({ x: 0, y: 0, width:1, height: 1 }, function () { ++count; });
    assert.ok(count === 100, "100 objects overall");
    if (count !== 100) console.log('100 !== ', count);
});

QUnit.test("QuadTreeQuery800Objects", function (assert) {
    // Create a quadtree with 800 objects in it (overlapped 8 deep)
    var tree = new TameGame.QuadTree();
    for (var x=0; x<8; ++x) {
        populateGrid(tree, 10, 10);
    }
    var count = 0;
    
    // Should be 9 objects in a 3x3 square
    tree.forAllInBounds({ x:0, y:0, width:.3, height:.3 }, function () { ++count; });
    assert.ok(count === 9*8, "9 objects in 3x3 square");
    if (count !== 9*8) console.log('9*8 !== ', count);
    
    // Should be 800 objects overall
    count = 0;
    tree.forAllInBounds({ x: 0, y: 0, width:1, height: 1 }, function () { ++count; });
    assert.ok(count === 800, "800 objects overall");
    if (count !== 800) console.log('800 !== ', count);
});

QUnit.test("QuadTreeQuery100ObjectsPlusSomeMore", function (assert) {
    // Create a quadtree with 100 objects in it
    var tree = new TameGame.QuadTree();
    populateGrid(tree, 10, 10);
    var count = 0;
    
    // Add some larger objects to the tree
    tree.addObject({ x: .1, y: .1, width: .2, height: .2 }, {});                // In the 3x3 square
    tree.addObject({ x: .5, y: .5, width: .5, height: .5 }, {});                // In the 10x10 square
    
    // Should be 9 objects in a 3x3 square
    tree.forAllInBounds({ x:0, y:0, width:.3, height:.3 }, function () { ++count; });
    assert.ok(count === 10, "10 objects in 3x3 square");
    if (count !== 10) console.log('10 !== ', count);
    
    // Should be 100 objects overall
    count = 0;
    tree.forAllInBounds({ x: 0, y: 0, width:1, height: 1 }, function () { ++count; });
    assert.ok(count === 102, "102 objects overall");
    if (count !== 102) console.log('102 !== ', count);
});
