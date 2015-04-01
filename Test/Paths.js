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

function approxPointEquals(a, b) {
    var xDiff = a.x - b.x;
    var yDiff = a.y - b.y;

    if (Math.abs(xDiff) < 0.01 && Math.abs(yDiff) < 0.01) {
        return true;
    } else {
        return false;
    }
}

QUnit.test("SimpleSpline", function (assert) {
    var splinePath = new TameGame.SplinePath([ 
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 5, y: 0 },
        { x: 2, y: 10 },
        { x: 10, y: -5 },
        { x: 10, y: 10 }
    ]);

    var startPoint  = splinePath.pointAt(0);
    var secondPoint = splinePath.pointAt(0.33333333333333);
    var thirdPoint  = splinePath.pointAt(0.666666666666666);
    var finalPoint  = splinePath.pointAt(1.0);

    assert.ok(startPoint.x == 1 && startPoint.y == 1, "Start point");
    assert.ok(approxPointEquals(secondPoint, { x: 5, y: 0 }), "Second point");
    assert.ok(approxPointEquals(thirdPoint, { x: 2, y: 10 }), "Third point");
    assert.ok(approxPointEquals(finalPoint, { x: 10, y: -5 }), "Fourth point");

    /*
    for (var x=0; x<=1.0; x += 0.05) {
        var point = splinePath.pointAt(x);
        console.log(x.toFixed(2), ' - ', point.x.toFixed(4), point.y.toFixed(4));
    }
    */
});
