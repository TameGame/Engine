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
    assert.ok(finished === 1, "FinishesAt1000ms");
    assert.ok(transitioned === 1, "FinishIsATransition");

    currentFrame = "notUpdated";
    animation.tick(initialTime + 1125.0);
    assert.ok(currentFrame === "notUpdated", "DoesNotUpdateAfterFinish");
});

QUnit.test("AnimationRepeatsFrames", function(assert) {
    // Create a 1s frame-based animation
    var animation = new TameGame.FrameAnimation([ "first", "second", "third", "fourth" ], { duration: 1000.0, repeat: true });

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
    assert.ok(currentFrame === "first", "FirstFrameAgainAt1000ms");
    assert.ok(finished === 0, "DoesNotFinishAt1000ms");
    assert.ok(transitioned === 1, "TransitionsAt1000ms");

    animation.tick(initialTime + 1500.0);
    assert.ok(currentFrame === "third", "ThirdFrameAgainAt1500ms");
    assert.ok(finished === 0, "DoesNotFinishAt1500ms")
    assert.ok(transitioned === 1, "StillTransitionsAt1000ms")

    animation.tick(initialTime + 2250.0);
    assert.ok(currentFrame === "second", "SecondFrameAt2250ms");
    assert.ok(finished === 0, "DoesNotFinishAt2250ms");
    assert.ok(transitioned === 2, "TransitionsAt2250ms");

    animation.tick(initialTime + 2500.0);
    animation.finish();
    animation.tick(initialTime + 2251.0);
    assert.ok(finished === 1, "FinishesWhenRequested");
});
