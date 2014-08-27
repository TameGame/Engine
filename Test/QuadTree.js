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

QUnit.test("QuadTreeExcludeObjectOutOfBounds", function (assert) {
    var tree    = new TameGame.QuadTree();
    var someRef = tree.addObject({ x: 0.5, y: 0.5, width: 0.25, height: 0.25 }, {});
    var count   = 0;
    
    tree.forAllInBounds({ x:-1, y: -1, width: 1, height: 1 }, function (obj) { ++count });
    
    assert.ok(someRef !== null);
    assert.ok(count === 0);
});
