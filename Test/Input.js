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
