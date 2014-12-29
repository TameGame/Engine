QUnit.test("AnimationReceiveFrames", function(assert) {
    // Create a 1s frame-based animation
    var animation = new TameGame.FrameAnimation([ "first", "second", "third", "fourth" ], { duration: 1000.0, repeat: false });

    var initialTime     = 1234.0;               // Some millisecond time when the animation is supposed to start
    var currentFrame    = "none";
    var finished        = 0;
    var transitioned    = 0;

    // Set up the animation to update the parameters when it ticks
    animation.onFrame(function (frame) { currentFrame = frame; }).onFinish(function () { ++finished; }).onTransition(function() { ++transitioned; });

    // Start the animation
    animation.start(initialTime);

    assert.ok(currentFrame === "none", "FrameNotUpdatedAtStart")

    // Tick to a time before the start
    animation.tick(initialTime - 250.0);

    assert.ok(currentFrame === "none", "FrameNotUpdatedInPrehistory")
    assert.ok(finished === 0, "DoesntFinishInPrehistory");

    // Tick to the initial time
    animation.tick(initialTime);
    assert.ok(finished === 0, "InitialNotFinished");
    assert.ok(currentFrame === "first", "StartOnFirstFrame");

    // Frames shouldn't update until enough time passes
    currentFrame = "notUpdated";
    animation.tick(initialTime + 125.0);
    assert.ok(currentFrame === "notUpdated", "OnlyUpdatesWhenFrameChanges");

    // Should get one frame every 250ms
    animation.tick(initialTime + 250.0);
    assert.ok(currentFrame === "second", "SecondFrameAt250ms");

    animation.tick(initialTime + 500.0);
    assert.ok(currentFrame === "third", "ThirdFrameAt500ms");

    animation.tick(initialTime + 750.0);
    assert.ok(currentFrame === "fourth", "FourthFrameAt750ms");

    animation.tick(initialTime + 1000.0);
    assert.ok(finished === 1, "FinishesAt1000ms")
    assert.ok(transitioned === 1, "FinishIsATransition")
});
