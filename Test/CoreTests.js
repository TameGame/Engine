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

QUnit.test("SceneImmediateNotSupported", function (assert) {
    // This is supposed to be unsupported, check that it throws an exception
    var thrownException = false;
    var someGame = new TameGame.StandardGame();
    var someScene = someGame.createScene();
    assert.throws(function () {
        someScene.watch(TameGame.ObjectDetails, TameGame.UpdatePass.Immediate, (function () { }));
    }, "Trying to watch an immediate property on a scene is an error");
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
