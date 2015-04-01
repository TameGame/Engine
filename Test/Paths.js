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
