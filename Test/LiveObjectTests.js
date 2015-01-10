QUnit.test("CanGetLiveTicks", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someObject = someGame.createObject();
    var someScene = someGame.createScene();
    var numTicks = 0;
    
    someScene.addObject(someObject);
    someScene.events.onTick(TameGame.UpdatePass.Mechanics, function (tickData) {
        if (numTicks === 0) {
            assert.ok(tickData.liveObjects.length === 1, "Our live object is actually live");
            assert.ok(tickData.duration === 1000.0/120.0, "Have a duration indicating 120fps");
        }
        ++numTicks;
    });
    
    someObject.aliveStatus.isAlive = true;
    someGame.startScene(someScene);
    
    someGame.tick(0);
    someGame.tick(999.0);
    
    assert.ok(numTicks > 0, "Got some ticks");
    assert.ok(numTicks === 120, "Running at 120 ticks per second");
});
