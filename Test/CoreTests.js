QUnit.test("CanCreateGame", function(assert) {
    var someGame = new TameGame.StandardGame();
    assert.ok(someGame !== null, "Game created");
});

QUnit.test("CanCreateObject", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someObject = someGame.createObject();
    assert.ok(someObject !== null, "Object created");
});

QUnit.test("PhysicsPassIsDeferredUntilTick", function(assert) {
    var someGame        = new TameGame.StandardGame();
    var someObject      = someGame.createObject();
    var changeProcessed = false;
    
    someGame.watch(TameGame.ObjectDetails,
                   TameGame.UpdatePass.Physics,
                   (function (obj, newvalue) { changeProcessed = true; }));
    
    assert.ok(changeProcessed === false, "Initially false");
    someObject.get(TameGame.ObjectDetails).objectName = "Test value";
    assert.ok(changeProcessed === false, "Watch update doesn't occur immediately");
    someGame.tick(0);
    assert.ok(changeProcessed === true, "Watch update occurs during game tick");
});

QUnit.test("PhysicsPassUpdatesOnlyOccurOnce", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someObject = someGame.createObject();
    var changeProcessed = false;
    var numUpdates = 0;
    
    someGame.watch(TameGame.ObjectDetails,
                   TameGame.UpdatePass.Physics,
                   (function (obj, newvalue) { changeProcessed = true; numUpdates++; }));
    
    someObject.get(TameGame.ObjectDetails).objectName = "Test value";
    someGame.tick(0);
    assert.ok(changeProcessed === true, "Watch update occurs during game tick");
    assert.ok(numUpdates === 1, "Update occurs once only");
    someGame.tick(1);
    assert.ok(numUpdates === 1, "Update doesn't reoccur on the next tick");
});

QUnit.test("CallingSetGeneratesUpdate", function(assert) {
    var someGame        = new TameGame.StandardGame();
    var someObject      = someGame.createObject();
    var numUpdates      = 0;
    
    someGame.watch(TameGame.ObjectDetails,
                   TameGame.UpdatePass.Immediate,
                   (function (obj, newvalue) { 
                       ++numUpdates; 
                       assert.ok(newvalue.objectName === 'UpdatedObject', "Updated value correctly");
                   }));
    
    someObject.get(TameGame.ObjectDetails).set({ objectName: "UpdatedObject" });
    assert.ok(numUpdates === 1, "Only one update");
});

QUnit.test("ImmediateIsImmediate", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someObject = someGame.createObject();
    var changeProcessed = false;
    var numUpdates = 0;
    
    someGame.watch(TameGame.ObjectDetails,
                   TameGame.UpdatePass.Immediate,
                   (function (obj, newvalue) { changeProcessed = true; ++numUpdates; }));
    
    assert.ok(changeProcessed === false, "Initially false");
    someObject.get(TameGame.ObjectDetails).objectName = "Test value";
    assert.ok(changeProcessed === true, "Watch update occurs immediately");
    someGame.tick(0);
    assert.ok(numUpdates === 1, "Update only occurs once");
});

QUnit.test("CanCreateScene", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someScene = someGame.createScene();
    
    assert.ok(someScene !== null, "Can create scene");
});

QUnit.test("SceneWatchesOnlyOccurOnObjectsInThatScene", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someObject = someGame.createObject();
    var someOtherObject = someGame.createObject();
    var someScene = someGame.createScene();
    var numUpdates = 0;
    var sceneObjectChanged = false;
    var nonSceneObjectChanged = false;
    
    someScene.watch(TameGame.ObjectDetails,
                    TameGame.UpdatePass.Physics,
                    (function (obj, newvalue) {
                        ++numUpdates;
                        if (obj === someObject) {
                            sceneObjectChanged = true;
                        } else {
                            nonSceneObjectChanged = true;
                        }
                    }));
    someScene.addObject(someObject);
    someGame.startScene(someScene);
                    
    someObject.get(TameGame.ObjectDetails).objectName = "Test";
    someOtherObject.get(TameGame.ObjectDetails).objectName = "Test";
    someGame.tick(0);
    
    assert.ok(sceneObjectChanged, "Object in scene changed");
    assert.ok(!nonSceneObjectChanged, "Object outside of scene not changed");
    assert.ok(numUpdates === 1, "Should only get one update");
});

QUnit.test("SceneWatchesDontOccurWhenSceneIsInactive", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someObject = someGame.createObject();
    var someOtherObject = someGame.createObject();
    var someScene = someGame.createScene();
    var numUpdates = 0;
    var sceneObjectChanged = false;
    var nonSceneObjectChanged = false;
    
    someScene.watch(TameGame.ObjectDetails,
                    TameGame.UpdatePass.Physics,
                    (function (obj, newvalue) {
                        ++numUpdates;
                        if (obj === someObject) {
                            sceneObjectChanged = true;
                        } else {
                            nonSceneObjectChanged = true;
                        }
                    }));
    someScene.addObject(someObject);
                    
    someObject.get(TameGame.ObjectDetails).objectName = "Test";
    someOtherObject.get(TameGame.ObjectDetails).objectName = "Test";
    someGame.tick(0);
    
    assert.ok(!sceneObjectChanged, "Object in scene should not be changed");
    assert.ok(!nonSceneObjectChanged, "Object outside of scene not changed");
    assert.ok(numUpdates === 0, "Should be no updates");
});

QUnit.test("SceneImmediateNotSupported", function (assert) {
    // This is supposed to be unsupported, check that it throws an exception
    var thrownException = false;
    var someGame = new TameGame.StandardGame();
    var someScene = someGame.createScene();
    assert.throws(function () {
        someScene.watch(TameGame.ObjectDetails, TameGame.UpdatePass.Immediate, (function () { }));
    }, "Trying to watch an immediate property on a scene is an error");
});

QUnit.test("CanCreateEvent", function (assert) {
    var evt = TameGame.createEvent();
    var fired = false;
    
    evt.register(function() { fired = true; });
    evt.fire(null, 1);
    
    assert.ok(fired, "Event registered and fired");
});

QUnit.test("CanCancelEvent", function (assert) {
    var evt = TameGame.createEvent();
    var fired = false;
    
    var cancellable = evt.register(function() { fired = true; });
    cancellable.cancel();
    evt.fire(null, 1);
    
    assert.ok(!fired, "Event should not fire after being cancelled");
});

QUnit.test("CanCreateTwoEvents", function (assert) {
    var evt = TameGame.createEvent();
    var firedOne = false;
    var firedTwo = false;
    
    evt.register(function() { firedOne = true; assert.ok(!firedTwo, "Event two not fired before event one"); });
    evt.register(function() { firedTwo = true; assert.ok(firedOne, "Event one fired before event two"); });
    evt.fire(null, 1);
    
    assert.ok(firedOne && firedTwo, "Two events registered and fired");
});

QUnit.test("CanCancelOneOfTwoEvents", function (assert) {
    var evt = TameGame.createEvent();
    var firedOne = false;
    var firedTwo = false;
    
    evt.register(function() { firedOne = true; assert.ok(!firedTwo, "Event two not fired before event one"); });
    var cancel = evt.register(function() { firedTwo = true; assert.ok(firedOne, "Event one fired before event two"); });
    cancel.cancel();
    evt.fire(null, 1);
    
    assert.ok(firedOne && !firedTwo, "Two events registered, and only one fired");
});

QUnit.test("CanTranslatePoint", function (assert) {
    var translationMatrix = TameGame.translateMatrix({ x:3, y:3 });
    var translatedPoint = TameGame.transform(translationMatrix, { x: 0, y: 0 });
    
    assert.ok(translatedPoint.x === 3);
    assert.ok(translatedPoint.y === 3);
});

QUnit.asyncTest("CanLoadJSON", function (assert) {
    expect(1);

    var ajaxLoader = new TameGame.AjaxDataManager();
    ajaxLoader.loadJsonData('Test.json').then(function (jsonObject) {
        assert.ok(jsonObject.Test === 'Yep', "Retrieved OK");
        QUnit.start();
    }).catch(function (error) {
        console.error('Failed', error);
        assert.ok(false, "Error");
        QUnit.start();
    });
});

QUnit.test("BoundingBoxOverlap", function (assert) {
    var bb1 = { x: -1, y:-1, width:1, height: 1 };
    var bb2 = { x: -0.5, y:-0.5, width: 1.5, height: 1.5 };
    var bb3 = { x: -2, y: -2, width: 4, height: 4 };
    var bb4 = { x: -4, y: -4, width: 1, height: 1 };
    
    assert.ok(TameGame.bbOverlaps(bb1, bb2));
    assert.ok(TameGame.bbOverlaps(bb2, bb1));
    assert.ok(TameGame.bbOverlaps(bb1, bb3));
    assert.ok(TameGame.bbOverlaps(bb3, bb1));
    assert.ok(!TameGame.bbOverlaps(bb1, bb4));
    assert.ok(!TameGame.bbOverlaps(bb4, bb1));
});

QUnit.test("BoundingBoxContains", function (assert) {
    var bb1 = { x: -1, y:-1, width:1, height: 1 };
    var bb2 = { x: -0.5, y:-0.5, width: 1.5, height: 1.5 };
    var bb3 = { x: -2, y: -2, width: 4, height: 4 };
    var bb4 = { x: -4, y: -4, width: 1, height: 1 };
    
    assert.ok(TameGame.bbContains(bb3, bb1));
    assert.ok(TameGame.bbContains(bb3, bb2));
    assert.ok(!TameGame.bbContains(bb1, bb3));
    assert.ok(!TameGame.bbContains(bb1, bb2));
    assert.ok(!TameGame.bbContains(bb2, bb1));
    assert.ok(!TameGame.bbContains(bb1, bb4));
    assert.ok(!TameGame.bbContains(bb4, bb1));
});

// =====================================
//  Simple performance test of the core
// =====================================
var someGame = new TameGame.StandardGame();
console.log(someGame);

var obj = someGame.createObject();

someGame.watch(TameGame.ObjectDetails, 
                TameGame.UpdatePass.Physics, 
                (function (obj, newValue) { console.log("ObjectDetails changed to ", newValue.objectName)}));

var numItems = 1000000;
var start = Date.now();
var props = obj.get(TameGame.ObjectDetails);
for (var x=0; x<numItems; ++x) {
    props.objectName = "Speed test";
}
var end = Date.now();
var timeMs = end - start;

console.log(numItems + " property-only updates in " + timeMs + "ms (" + (numItems/(timeMs/1000.0)) + "/sec)");

var start = Date.now();
for (var x=0; x<numItems; ++x) {
    obj.get(TameGame.ObjectDetails).objectName = "Speed test";
}
var end = Date.now();
var timeMs = end - start;

console.log(numItems + " updates in " + timeMs + "ms (" + (numItems/(timeMs/1000.0)) + "/sec)");
console.log("At 60fps, can update a maximum of " + numItems*(16.6666/timeMs) + " items per frame");

var start = Date.now();
for (var x=0; x<numItems; ++x) {
    obj.objectName = "Just properties";
}
var end = Date.now();
var fastTimeMs = end - start;

console.log(numItems + " fast updates in " + fastTimeMs + "ms (" + (numItems/(fastTimeMs/1000.0)) + "/sec)");
console.log("Slowdown factor " + (timeMs/fastTimeMs));

someGame.tick(3);

function testItemRenderingSpeed() {
    var start = Date.now();
    var numItemsToTest = 100000;
    var queue = new TameGame.StandardRenderQueue();

    for (var x=0; x<numItemsToTest; ++x) {
        queue.addItem({ action: 0, zIndex: x, intValues: [0] });
    }
    
    var midPoint = Date.now();

    queue.render(function (item) { });

    var end = Date.now();

    var itemsPerFrame = (numItemsToTest/(end-start)) * (1000/60);
    console.log("Renderered " + numItemsToTest + " items in " + (end-start) + "ms (" + itemsPerFrame + " items per frame at 60fps)");
    console.log("(MidPoint reached after " + (midPoint-start) + "ms");
}

testItemRenderingSpeed();
testItemRenderingSpeed();
testItemRenderingSpeed();
