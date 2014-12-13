// == TEST DEFAULT CONTROL ROUTER

QUnit.test("MapControlBindingsThroughBindingDispatch", function (assert) {
    // Simple router with a single control in it
    var binder = TameGame.createInputBinder([ { testAction: [ { device: 'test', control: 'someControl' } ] } ]);

    // Routing that control should go to the test action
    var routedTo = binder({ device: 'test', control: 'someControl' });
    assert.ok(routedTo === 'testAction', 'ControlMapsToAction');
});

QUnit.test("MapControlBindingsThroughDefaultRouter", function (assert) {
    // Simple router with a single control in it
    var defaultRouter = new TameGame.DefaultControlRouter();
    defaultRouter.addControlBinding({ testAction: [ { device: 'test', control: 'someControl' } ] });

    // Routing that control should go to the test action
    var routedTo = defaultRouter.actionForInput({ device: 'test', control: 'someControl' });
    assert.ok(routedTo === 'testAction', 'ControlMapsToAction');
});

QUnit.test("MapMultipleActions", function (assert) {
    // Simple router with a single control in it
    var defaultRouter = new TameGame.DefaultControlRouter();
    defaultRouter.addControlBinding({ testAction1: [ { device: 'test', control: 'firstControl' } ], testAction2: [ { device: 'test', control: 'secondControl' } ] });

    // Routing that control should go to the test action
    var routedTo = defaultRouter.actionForInput({ device: 'test', control: 'firstControl' });
    assert.ok(routedTo === 'testAction1', 'FirstControl');

    routedTo = defaultRouter.actionForInput({ device: 'test', control: 'secondControl' });
    assert.ok(routedTo === 'testAction2', 'SecondControl');
});

QUnit.test("MapMultipleControls", function (assert) {
    // Simple router with a single control in it
    var defaultRouter = new TameGame.DefaultControlRouter();
    defaultRouter.addControlBinding({ testAction1: [ { device: 'test', control: 'firstControl' }, { device: 'test', control: 'secondControl' } ] });

    // Routing that control should go to the test action
    var routedTo = defaultRouter.actionForInput({ device: 'test', control: 'firstControl' });
    assert.ok(routedTo === 'testAction1', 'FirstControl');

    routedTo = defaultRouter.actionForInput({ device: 'test', control: 'secondControl' });
    assert.ok(routedTo === 'testAction1', 'SecondControl');
});

QUnit.test("HigherPriorityActionsComeFirst", function (assert) {
    // Router with a control with a higher priority
    var defaultRouter = new TameGame.DefaultControlRouter();
    defaultRouter.addControlBinding({ testPriority: [ { device: 'test', control: 'someControl' } ] }, 1);
    defaultRouter.addControlBinding({ testAction: [ { device: 'test', control: 'someControl' } ] }, 0);

    // Routing that control should go to the test action
    var routedTo = defaultRouter.actionForInput({ device: 'test', control: 'someControl' });
    assert.ok(routedTo === 'testPriority', 'ControlMapsToAction');
});

QUnit.test("LatestMappingHasPriority", function (assert) {
    // Router with a control with a higher priority
    var defaultRouter = new TameGame.DefaultControlRouter();
    defaultRouter.addControlBinding({ testPriority: [ { device: 'test', control: 'someControl' } ] }, 0);
    defaultRouter.addControlBinding({ testAction: [ { device: 'test', control: 'someControl' } ] }, 0);

    // Routing that control should go to the test action
    var routedTo = defaultRouter.actionForInput({ device: 'test', control: 'someControl' });
    assert.ok(routedTo === 'testAction', 'ControlMapsToAction');
});

// === TEST DEFAULT CONTROL EVENTS

(function () {
    // Create a shared input binder we'll use for these tests
    var testBinder = TameGame.createInputBinder([
        { testAction1: [ { device: 'test', control: 'control1' } ] },
        { testAction2: [ { device: 'test', control: 'control2' } ] },
        { testAction3: [ { device: 'test', control: 'control3' } ] },
        { testAction4: [ { device: 'test', control: 'control4' } ] },
    ]);

    QUnit.test("ControlMovesDownOnPointFivePressure", function (assert) {
        var defaultEvents = new TameGame.DefaultControlEvents(testBinder);
        var actionDown = false;

        defaultEvents.onActionDown('testAction1', function (control) {
            actionDown = true;
        });

        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 0.5, when: 0 } ], 0);
        assert.ok(actionDown, 'Control was pressed');
    });

    QUnit.test("ControlDoesNotMoveDownOnLessThanPointFivePressure", function (assert) {
        var defaultEvents = new TameGame.DefaultControlEvents(testBinder);
        var actionDown = false;

        defaultEvents.onActionDown('testAction1', function (control) {
            actionDown = true;
        });

        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 0.25, when: 0 } ], 0);
        assert.ok(!actionDown, 'Control was not pressed');
    });

    QUnit.test("DownEventFiresOnlyOnce", function (assert) {
        var defaultEvents = new TameGame.DefaultControlEvents(testBinder);
        var actionDownCount = 0;

        defaultEvents.onActionDown('testAction1', function (control) {
            ++actionDownCount;
        });

        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 1.0, when: 0 } ], 0);
        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 1.0, when: 0 } ], 0);
        assert.ok(actionDownCount === 1, 'Event fired only once');
    });

    QUnit.test("UpEventFireWhenPressureDrops", function (assert) {
        var defaultEvents = new TameGame.DefaultControlEvents(testBinder);
        var actionDownCount = 0;
        var actionUpCount = 0;

        defaultEvents.onActionDown('testAction1', function (control) {
            ++actionDownCount;
        });
        defaultEvents.onActionUp('testAction1', function (control) {
            ++actionUpCount;
        });

        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 1.0, when: 0 } ], 0);
        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 0.5, when: 0 } ], 0);           // Still 'down'
        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 0.2, when: 0 } ], 0);           // Moves 'up' when pressure drops below 0.5
        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 0, when: 0 } ], 0);             // Still 'up'

        assert.ok(actionDownCount === 1, 'Control went down');
        assert.ok(actionUpCount === 1, 'Control went up');
    });


    QUnit.test("DuringEventsAlwaysFireWhenPressureGreaterThanZero", function (assert) {
        var defaultEvents = new TameGame.DefaultControlEvents(testBinder);
        var actionDuringCount = 0;

        defaultEvents.onDuringAction('testAction1', function (control) {
            ++actionDuringCount;
        });

        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 1.0, when: 0 } ], 0);
        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 0.5, when: 0 } ], 0);           // Still 'down'
        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 0.2, when: 0 } ], 0);
        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 0, when: 0 } ], 0);             // Released, should produce no event
        defaultEvents.tickInputs([ { device: 'test', control: 'control1', pressure: 0, when: 0 } ], 0);             // Released, should produce no event

        assert.ok(actionDuringCount === 3, 'During fires while control is active');
    });
})();

