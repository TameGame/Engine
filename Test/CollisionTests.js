QUnit.test("DoesntCollide", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = new TameGame.Polygon([ { x:4, y:4 }, { x:5, y:5 }, { x:4, y:5 }]);
    
    var collides = TameGame.satCollision(triangle1, triangle2);
    
    assert.ok(collides.collided === false);
});

QUnit.test("DoesntCollideCircle", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var circle2 = new TameGame.Circle({ x: 4.5, y: 4.5 }, 1);
    
    var collides = TameGame.satCollision(triangle1, circle2);
    
    assert.ok(collides.collided === false);
});

QUnit.test("DoesntCollideTwoCircle", function(assert) {
    var circle1 = new TameGame.Circle({ x: 1.5, y: 1.5 }, 1);
    var circle2 = new TameGame.Circle({ x: 4.5, y: 4.5 }, 1);
    
    var collides = TameGame.satCollision(circle1, circle2);
    
    assert.ok(collides.collided === false);
});

QUnit.test("DoesCollideWhenOnTopOfEachOther", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    
    var collides = TameGame.satCollision(triangle1, triangle2);
    
    assert.ok(collides.collided === true);
});

QUnit.test("DoesCollideWhenOnTopOfEachOtherCircle", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var circle2 = new TameGame.Circle({ x: 1.5, y: 1.5 }, 1);
    
    var collides = TameGame.satCollision(triangle1, circle2);
    
    assert.ok(collides.collided === true);
});

QUnit.test("DoesCollideWhenOnTopOfEachOtherTwoCircle", function(assert) {
    var circle1 = new TameGame.Circle({ x: 1.5, y: 1.5 }, 1);;
    var circle2 = new TameGame.Circle({ x: 1.5, y: 1.5 }, 1);
    
    var collides = TameGame.satCollision(circle1, circle2);
    
    assert.ok(collides.collided === true);
});

QUnit.test("DoesntCollideWhenOnTopOfEachOtherTouchingCircle", function(assert) {
    var circle1 = new TameGame.Circle({ x: 1.5, y: 1.5 }, 1);;
    var circle2 = new TameGame.Circle({ x: 2.5, y: 1.5 }, 1);
    
    var collides = TameGame.satCollision(circle1, circle2);
    
    assert.ok(collides.collided === false);
});

QUnit.test("DoesCollideSmallIntersection", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = new TameGame.Polygon([ { x:1.8, y:1.8 }, { x:2.8, y:2.8 }, { x:1.8, y:2.8 }]);
    
    var collides = TameGame.satCollision(triangle1, triangle2);
    
    assert.ok(collides.collided === true);
});

QUnit.test("DoesCollideSmallIntersectionCircle", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var circle2 = new TameGame.Circle({ x:1.8, y:1.8 }, 1);
    
    var collides = TameGame.satCollision(triangle1, circle2);
    
    assert.ok(collides.collided === true);
});

QUnit.test("DoesntCollideAfterTranslation", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = triangle1.transform(TameGame.translateMatrix({ x:3, y:3 }));
    
    var collides1 = TameGame.satCollision(triangle1, triangle2);
    var collides2 = TameGame.satCollision(triangle2, triangle1);
    
    assert.ok(collides1.collided === false);
    assert.ok(collides2.collided === false);
});

QUnit.test("DoesCollideAfterTranslation", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = triangle1.transform(TameGame.translateMatrix({ x:.5, y:.5 }));
    
    var collides1 = TameGame.satCollision(triangle1, triangle2);
    var collides2 = TameGame.satCollision(triangle2, triangle1);
    
    assert.ok(collides1.collided === true);
    assert.ok(collides2.collided === true);
});

QUnit.test("DoesNotCollideAfterMtv", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = triangle1.transform(TameGame.translateMatrix({ x:.5, y:.5 }));
    
    var collides1 = TameGame.satCollision(triangle2, triangle1);
    
    assert.ok(collides1.collided === true, 'Triangles are initially in collision');
    
    var triangle3 = triangle2.transform(TameGame.translateMatrix(collides1.getMtv()));
    var collides2 = TameGame.satCollision(triangle1, triangle3);
    
    if (collides2.collided) {
        console.log(triangle3.getVertices());
        console.log(collides1.getMtv());
        console.log(collides2.getMtv());
    }
    
    assert.ok(collides2.collided === false, 'Triangles are not in collision after translating along the MTV');
});

QUnit.test("DoesCollideJustInsideMtv", function(assert) {
    var triangle1 = new TameGame.Polygon([ { x:1, y:1 }, { x:2, y:2 }, { x:1, y:2 }]);
    var triangle2 = triangle1.transform(TameGame.translateMatrix({ x:.5, y:.5 }));
    
    var collides1 = TameGame.satCollision(triangle1, triangle2);
    
    assert.ok(collides1.collided === true, 'Triangles are initially in collision');
    
    var mtv = collides1.getMtv();
    var slightlyBackwards = { x: -mtv.x*0.0000001, y: -mtv.y*0.0000001 };
    var triangle3 = triangle2.transform(TameGame.multiplyMatrix(TameGame.translateMatrix(mtv), TameGame.translateMatrix(slightlyBackwards)));
    
    var collides2 = TameGame.satCollision(triangle1, triangle3);
    
    assert.ok(collides2.collided === true, 'Triangles are in collision slightly inside the MTV');
});

QUnit.test("ObjectCollisionDuringPass", function (assert) {
    var someGame = new TameGame.StandardGame();
    var someScene = someGame.createScene();
    someGame.tick(0);

    // Create two objects and move them into collision by changing their presence
    var obj1 = someGame.createObject();
    var obj2 = someGame.createObject();

    someScene.addObject(obj1);
    someScene.addObject(obj2);
    someGame.startScene(someScene);

    obj1.setup.size(2,2).moveTo({ x: .5, y: .5 }).useBasicShape();
    obj2.setup.size(2,2).moveTo({ x: -.5, y: -.5 }).useBasicShape();
    
    // Count the number of collisions
    var collideCount1 = 0;
    var collideCount2 = 0;
    obj1.behavior.objectCollision.collided = function () { ++collideCount1; };
    obj2.behavior.objectCollision.collided = function () { ++collideCount2; };
    
    // Run the pass
    someGame.tick(someGame.tickRate);
    
    if (collideCount1 !== 1) {
        console.log('1 !==', collideCount1);
    }
    if (collideCount2 !== 1) {
        console.log('1 !==', collideCount2);
    }
    
    assert.ok(collideCount1 === 1, "Caused a single AABB collision on first object");
    assert.ok(collideCount2 === 1, "Caused a single AABB collision on second object");

    someGame.tick(someGame.tickRate*2);               // Nothing moves, so no more collisions

    assert.ok(collideCount1 === 2 && collideCount2 === 2, "Collision occurs each pass");
});

QUnit.test("NoCollisionIfNotOverlapping", function (assert) {
    var someGame = new TameGame.StandardGame();
    var someScene = someGame.createScene();

    // Create two objects and move them into collision by changing their presence
    var objPos = { quad: { x1: -1, y1: -1, x2: 1, y2: -1, x3: 1, y3: 1, x4: -1, y4: 1 } };
    
    var obj1 = someGame.createObject();
    var obj2 = someGame.createObject();
    
    someScene.addObject(obj1);
    someScene.addObject(obj2);
    someGame.startScene(someScene);
    
    obj1.position = objPos;
    obj2.position = objPos;
    
    obj1.presence.location = { x: 2, y: 2 };
    obj2.presence.location = { x: -2, y: -2 };
    
    // Count the number of collisions
    var collideCount1 = 0;
    var collideCount2 = 0;
    obj1.behavior.aabbCollision.collided = function () { ++collideCount1; };
    obj2.behavior.aabbCollision.collided = function () { ++collideCount2; };
    
    // Run the pass
    someGame.tick(0);
    someGame.tick(1);               // Nothing moves, so no more collisions
    
    if (collideCount1 !== 0) {
        console.log('0 !==', collideCount1);
    }
    if (collideCount2 !== 0) {
        console.log('0 !==', collideCount2);
    }
    
    assert.ok(collideCount1 === 0, "No collisions on first object");
    assert.ok(collideCount2 === 0, "No collisions on second object");
});
