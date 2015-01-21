QUnit.test("CanCreateGame", function(assert) {
    var someGame = new TameGame.StandardGame();
    assert.ok(someGame !== null, "Game created");
});

QUnit.test("CanCreateObject", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someObject = someGame.createObject();
    assert.ok(someObject !== null, "Object created");
});

QUnit.test("CanUseUninitializedField", function (assert) {
    var obj = {};
    var initCount = 0;
    TameGame.defineUnintializedField(obj, 'test', function () {
        initCount++;
        return 'InitialVal' + initCount;
    });

    TameGame.defineUnintializedField(obj, 'test2', function () {
        initCount++;
        return 'InitialVal' + initCount;
    });

    assert.ok(initCount === 0, "Does not immediately initialize");

    assert.ok(obj.test === 'InitialVal1', "Initializes to the initial val");
    assert.ok(obj.test === 'InitialVal1', "Only initialized once");

    obj.test = 'Changed';
    assert.ok(obj.test === 'Changed', "Changes OK");

    obj.test2 = 'StartWithInit';
    assert.ok(obj.test2 === 'StartWithInit', "Can replace the value without initialization");
});

QUnit.test("PrototypeUninitializedField", function (assert) {
    function obj() { }
    var initCount = 0;
    TameGame.defineUnintializedField(obj.prototype, 'test', function () {
        initCount++;
        return 'InitialVal' + initCount;
    });

    var test1 = new obj();
    var test2 = new obj();
    var test3 = new obj();

    assert.ok(initCount === 0, "Does not immediately initialize");

    assert.ok(test1.test === 'InitialVal1', "First object initializes OK");
    assert.ok(test2.test === 'InitialVal2', "First object initializes OK and differently");
    assert.ok(test1.test === 'InitialVal1', "First object does not reinitialize");

    test2.test = 'Changed';
    assert.ok(test2.test === 'Changed', "Can update the field after initializing it");

    delete test1.test;
    test1.test = 'Changed';
    assert.ok(test1.test === 'Changed', "Can update the field by deletion");

    test3.test = 'Changed';
    assert.ok(test3.test === 'Changed', "Can assign a value to an uninitialized field");
});

QUnit.test("PrototypeContextualField", function (assert) {
    function obj() { }
    TameGame.defineContextualField(obj.prototype, "test", { getContext: function () { return this._context; } });

    var test1 = new obj();
    var test2 = new obj();

    var context1 = test1.test.getContext();
    var context2 = test2.test.getContext();

    assert.ok(context1 === test1);
    assert.ok(context2 === test2);
    assert.ok(context1 !== context2);
});

QUnit.test("PhysicsPassIsDeferredUntilTick", function(assert) {
    var someGame        = new TameGame.StandardGame();
    var someObject      = someGame.createObject();
    var changeProcessed = false;
    
    someGame.watch(TameGame.ObjectDetails,
                   TameGame.UpdatePass.PhysicsMotion,
                   (function (obj, newvalue) { changeProcessed = true; }));
    
    assert.ok(changeProcessed === false, "Initially false");
    someObject.details.objectName = "Test value";
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
                   TameGame.UpdatePass.PhysicsMotion,
                   (function (obj, newvalue) { changeProcessed = true; numUpdates++; }));
    
    someObject.details.objectName = "Test value";
    someGame.tick(0);
    assert.ok(changeProcessed === true, "Watch update occurs during game tick");
    assert.ok(numUpdates === 1, "Update occurs once only");
    someGame.tick(1);
    assert.ok(numUpdates === 1, "Update doesn't reoccur on the next tick");
});

QUnit.test("SceneSinglePassEventFires", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someScene = someGame.createScene();
    someGame.startScene(someScene);

    var fireCount = 0;
    someScene.onPass(TameGame.UpdatePass.PhysicsMotion, function () { fireCount++ });
    assert.ok(fireCount === 0, "Count initially 0");
    someGame.tick(0);
    assert.ok(fireCount === 1, "Fires during tick");
    someGame.tick(1);
    assert.ok(fireCount === 1, "Fires only once");
});

QUnit.test("SceneEveryPassEventFires", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someScene = someGame.createScene();
    someGame.startScene(someScene);

    var fireCount = 0;
    var toCancel = someScene.everyPass(TameGame.UpdatePass.PhysicsMotion, function () { fireCount++ });
    assert.ok(fireCount === 0, "Count initially 0");
    someGame.tick(0);
    assert.ok(fireCount === 1, "Fires during tick");
    someGame.tick(1);
    assert.ok(fireCount === 2, "Fires every pass");

    toCancel.cancel();
    someGame.tick(2);
    assert.ok(fireCount === 2, "Stops firing when cancelled");
});

QUnit.test("GameSinglePassEventFires", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someScene = someGame.createScene();
    someGame.startScene(someScene);

    var fireCount = 0;
    someGame.onPass(TameGame.UpdatePass.PhysicsMotion, function () { fireCount++ });
    assert.ok(fireCount === 0, "Count initially 0");
    someGame.tick(0);
    assert.ok(fireCount === 1, "Fires during tick");
    someGame.tick(1);
    assert.ok(fireCount === 1, "Fires only once");
});

QUnit.test("GameEveryPassEventFires", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someScene = someGame.createScene();
    someGame.startScene(someScene);

    var fireCount = 0;
    var toCancel = someGame.everyPass(TameGame.UpdatePass.PhysicsMotion, function () { fireCount++ });
    assert.ok(fireCount === 0, "Count initially 0");
    someGame.tick(0);
    assert.ok(fireCount === 1, "Fires during tick");
    someGame.tick(1);
    assert.ok(fireCount === 2, "Fires every pass");

    toCancel.cancel();
    someGame.tick(2);
    assert.ok(fireCount === 2, "Stops firing when cancelled");
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
    
    someObject.details = { objectName: "UpdatedObject" };
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
    someObject.details.objectName = "Test value";
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
                    TameGame.UpdatePass.PhysicsMotion,
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
                    
    someObject.details.objectName = "Test";
    someOtherObject.details.objectName = "Test";
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
                    TameGame.UpdatePass.PhysicsMotion,
                    (function (obj, newvalue) {
                        ++numUpdates;
                        if (obj === someObject) {
                            sceneObjectChanged = true;
                        } else {
                            nonSceneObjectChanged = true;
                        }
                    }));
    someScene.addObject(someObject);
                    
    someObject.details.objectName = "Test";
    someOtherObject.details.objectName = "Test";
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
    
    assert.ok(TameGame.bbOverlaps({ x: 0, y: 0, width: .3, height: .3 }, { x: .2, y: .2, width: .1, height: .1 }));
    assert.ok(TameGame.bbOverlaps({ x: .2, y: .2, width: .1, height: .1 }, { x: 0, y: 0, width: .3, height: .3 }));

    assert.ok(TameGame.bbOverlaps({ x: 0, y: 0, width: 1, height: 1 }, { x: .2, y: .2, width: .1, height: .1 }));
    assert.ok(TameGame.bbOverlaps({ x: 0, y: 0, width: 1, height: 1 }, { x: .8, y: .8, width: .1, height: .1 }));
    assert.ok(TameGame.bbOverlaps({ x: 0, y: 0, width: 1, height: 1 }, { x: .9, y: .9, width: .1, height: .1 }));
});

QUnit.test("BoundingBoxContains", function (assert) {
    var bb1 = { x: -1, y:-1, width:1, height: 1 };
    var bb2 = { x: -0.5, y:-0.5, width: 1.5, height: 1.5 };
    var bb3 = { x: -2, y: -2, width: 4, height: 4 };
    var bb4 = { x: -4, y: -4, width: 1, height: 1 };
    
    assert.ok(TameGame.bbContains(bb1, bb1));
    assert.ok(TameGame.bbContains(bb3, bb1));
    assert.ok(TameGame.bbContains(bb3, bb2));
    assert.ok(!TameGame.bbContains(bb1, bb3));
    assert.ok(!TameGame.bbContains(bb1, bb2));
    assert.ok(!TameGame.bbContains(bb2, bb1));
    assert.ok(!TameGame.bbContains(bb1, bb4));
    assert.ok(!TameGame.bbContains(bb4, bb1));
});

QUnit.test("BoundingBoxToQuadAndBack", function (assert) {
    var boundingBox = { x: -1, y: -1, width: 2, height: 2 };
    var quad = TameGame.bbToQuad(boundingBox);
    var back = TameGame.quadBoundingBox(quad);
    
    assert.ok(back.x === boundingBox.x);
    assert.ok(back.y === boundingBox.y);
    assert.ok(back.width === boundingBox.width);
    assert.ok(back.height === boundingBox.height);
});

TameGame.declareBehavior('test', function () { return { test: function (obj) { obj.tested = true; }} });
TameGame.declareBehaviorClass('testClass1', { test: { test: function (obj) { obj.testClass1 = true; } } });
TameGame.declareBehaviorClass('testClass2', { test: { test: function (obj) { obj.testClass2 = true; } } });
TameGame.declareBehaviorClass('noTestClass', { });

QUnit.test("ClassesAreApplied", function (assert) {
    var game    = new TameGame.StandardGame();
    var someObj = game.createObject();

    assert.ok(someObj.behavior.test, 'Test behavior defined');

    assert.ok(!someObj.tested, 'Default behavior not initially invoked');
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.tested, 'Default behavior invoked');

    someObj.tested = false;
    someObj.testClass1 = false;
    someObj.behavior.addClass('testClass1');
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testClass1, 'First class applied');
    assert.ok(!someObj.tested, 'Default behavior overridden');

    someObj.tested = false;
    someObj.testClass1 = false;
    someObj.testClass2 = false;
    someObj.behavior.addClass('testClass2');
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testClass2, 'Second class applied');
    assert.ok(!someObj.testClass1, 'First class overridden');
    assert.ok(!someObj.tested, 'Default behavior still overridden');

    someObj.tested = false;
    someObj.testClass1 = false;
    someObj.testClass2 = false;
    someObj.behavior.removeClass('testClass2');
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testClass1, 'Second class removed; back to first class');
    assert.ok(!someObj.testClass2, 'Second class not invoked');

    someObj.tested = false;
    someObj.testClass1 = false;
    someObj.testClass2 = false;
    someObj.behavior.addClass('noTestClass');
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testClass1, 'First test class is used if main class does not implement method');
    assert.ok(!someObj.tested, 'Default behavior still overridden');

    someObj.tested = false;
    someObj.testClass1 = false;
    someObj.testClass2 = false;
    someObj.behavior.removeClass('testClass1');
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.tested, 'Removing all classes reverts behavior back to default');
});

TameGame.declareBehaviorState('state1', { test: { test: function (obj) { obj.testState1 = true; } } });
TameGame.declareBehaviorState('state2', { test: { test: function (obj) { obj.testState2 = true; } } });
TameGame.declareBehaviorClassState('testClass1', 'state1', { test: { test: function (obj) { obj.testClass1State1 = true; } } });
TameGame.declareBehaviorClassState('testClass3', 'state1', { test: { test: function (obj) { obj.testClass3State1 = true; } } });

QUnit.test("StatesAreApplied", function (assert) {
    var game    = new TameGame.StandardGame();
    var someObj = game.createObject();

    assert.ok(someObj.behavior.test, 'Test behavior defined');

    assert.ok(!someObj.tested, 'Default behavior not initially invoked');
    console.log(someObj.behavior.test);
    console.log(someObj.behavior.test.test);
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.tested, 'Default behavior invoked when no state');

    someObj.tested              = false;
    someObj.testState1          = false;
    someObj.testState2          = false;
    someObj.testClass1State1    = false;
    someObj.behavior.state = 'state1';
    console.log(someObj.behavior.test);
    console.log(someObj.behavior.test.test);
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testState1, 'State1 default behavior invoked');

    someObj.tested              = false;
    someObj.testState1          = false;
    someObj.testState2          = false;
    someObj.testClass1State1    = false;
    someObj.behavior.state = 'state2';
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testState2, 'State2 default behavior invoked');

    someObj.tested              = false;
    someObj.testState1          = false;
    someObj.testState2          = false;
    someObj.testClass1State1    = false;
    someObj.behavior.state = 'state2';
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testState2, 'State2 default behavior invoked');

    someObj.tested              = false;
    someObj.testState1          = false;
    someObj.testState2          = false;
    someObj.testClass1State1    = false;
    someObj.behavior.addClass('testClass1');
    someObj.behavior.state = 'state2';
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testClass1, 'TestClass1 behavior invoked when state2 is applied');
    assert.ok(!someObj.testState2, '(Not standard state behavior)');

    someObj.tested              = false;
    someObj.testState1          = false;
    someObj.testState2          = false;
    someObj.testClass1State1    = false;
    someObj.behavior.state = 'state1';
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testClass1State1, 'State1 classful state behavior invoked');

    someObj.tested              = false;
    someObj.testState1          = false;
    someObj.testState2          = false;
    someObj.testClass1State1    = false;
    someObj.behavior.removeClass('testClass1');
    someObj.behavior.addClass('testClass3');
    someObj.behavior.state = 'state2';
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testState2, 'Default stateful behavior invoked when class does not provide behavior');

    someObj.tested              = false;
    someObj.testState1          = false;
    someObj.testState2          = false;
    someObj.testClass1State1    = false;
    someObj.behavior.state = 'state1';
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.testClass3State1, "Classes can override behavior by state even if it doesn't exist in the class itself");

    someObj.tested              = false;
    someObj.testState1          = false;
    someObj.testState2          = false;
    someObj.testClass1State1    = false;
    someObj.behavior.removeClass('testClass3');
    someObj.behavior.state = 'randomState';
    someObj.behavior.test.test(someObj);
    assert.ok(someObj.tested, 'Default behavior when unknown state is added');
});

// =====================================
//  Simple performance test of the core
// =====================================
var someGame = new TameGame.StandardGame();
console.log(someGame);

var obj = someGame.createObject();

someGame.watch(TameGame.ObjectDetails, 
                TameGame.UpdatePass.PhysicsMotion, 
                (function (obj, newValue) { console.log("ObjectDetails changed to ", newValue.objectName)}));

var numItems = 1000000;
var start = Date.now();
var props = obj.details;
for (var x=0; x<numItems; ++x) {
    props.objectName = "Speed test";
}
var end = Date.now();
var timeMs = end - start;

console.log(numItems + " property-only updates in " + timeMs + "ms (" + (numItems/(timeMs/1000.0)) + "/sec)");

var start = Date.now();
for (var x=0; x<numItems; ++x) {
    obj.details.objectName = "Speed test";
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
