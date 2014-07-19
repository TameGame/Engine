QUnit.test("CanGetLiveTicks", function(assert) {
    var someGame = new TameGame.StandardGame();
    var someObject = someGame.createObject();
    var someScene = someGame.createScene();
    var numTicks = 0;
    
    someScene.addObject(someObject);
    someScene.events.onTick(TameGame.UpdatePass.Animations, function (tickData) {
        ++numTicks;
    });
    
    someObject.get(TameGame.AliveStatus).isAlive = true;
    someGame.startScene(someScene);
    
    someGame.tick(0);
    someGame.tick(999.0);
    
    assert.ok(numTicks > 0, "Got some ticks");
    assert.ok(numTicks === 60, "Running at 60 ticks per second");
});
