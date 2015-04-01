QUnit.test("SimpleLinearPath", function(assert) {
    var linearPath = new TameGame.LinearPath({ x: 2, y: 3 }, { x: 12, y: 8 });

    var startPoint  = linearPath.pointAt(0);
    var endPoint    = linearPath.pointAt(1);
    var halfWay     = linearPath.pointAt(0.5);

    assert.ok(startPoint.x === 2, "Start X");
    assert.ok(startPoint.y === 3, "Start Y");

    assert.ok(endPoint.x === 12, "End X");
    assert.ok(endPoint.y === 8, "End Y");

    assert.ok(halfWay.x === 7, "Halfway X");
    assert.ok(halfWay.y === 5.5, "Halfway Y");
});

QUnit.test("SplineUtilsWorkForSimpleLine", function (assert) {
    var splineFn = TameGame.createSplineFn({ x: 2, y: 1 }, { x: 10, y: 5 }, { x: 0, y: 0 }, { x: 12, y: 6 });

    var startPoint  = splineFn(0);
    var endPoint    = splineFn(1);
    var halfWay     = splineFn(0.5);

    assert.ok(startPoint.x === 2, "Start X");
    assert.ok(startPoint.y === 1, "Start Y");

    assert.ok(endPoint.x === 10, "End X");
    assert.ok(endPoint.y === 5, "End Y");

    assert.ok(halfWay.x === 6, "Halfway X");
    assert.ok(halfWay.y === 3, "Halfway Y");
});
