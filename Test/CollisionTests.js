QUnit.test("DoesntCollide", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = new TameGame.Polygon([ { x:4, y:4 }, { x:5, y:5 }, { x:4, y:5 }]);
    
    var collides = TameGame.satCollision(triangle1, triangle2);
    
    assert.ok(collides.collided === false);
});

QUnit.test("DoesCollideWhenOnTopOfEachOther", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    
    var collides = TameGame.satCollision(triangle1, triangle2);
    
    assert.ok(collides.collided === true);
});

QUnit.test("DoesCollideSmallIntersection", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = new TameGame.Polygon([ { x:1.8, y:1.8 }, { x:2.8, y:2.8 }, { x:1.8, y:2.8 }]);
    
    var collides = TameGame.satCollision(triangle1, triangle2);
    
    assert.ok(collides.collided === true);
});

QUnit.test("DoesntCollideAfterTranslation", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = triangle1.transform(TameGame.translateMatrix({ x:3, y:3 }));
    
    var collides = TameGame.satCollision(triangle1, triangle2);
    
    assert.ok(collides.collided === false);
});

QUnit.test("DoesCollideAfterTranslation", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = triangle1.transform(TameGame.translateMatrix({ x:.5, y:.5 }));
    
    var collides = TameGame.satCollision(triangle1, triangle2);
    
    assert.ok(collides.collided === true);
});
