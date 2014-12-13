QUnit.test("CanMapControlBindingsThroughBindingDispatch", function (assert) {
    // Simple router with a single control in it
    var binder = TameGame.createInputBinder([ { testAction: [ { device: 'test', control: 'someControl' } ] } ]);

    // Routing that control should go to the test action
    var routedTo = binder({ device: 'test', control: 'someControl' });
    assert.ok(routedTo === 'testAction', 'ControlMapsToAction');
});

QUnit.test("CanMapControlBindingsThroughDefaultRouter", function (assert) {
    // Simple router with a single control in it
    var defaultRouter = new TameGame.DefaultControlRouter();
    defaultRouter.addControlBinding({ testAction: [ { device: 'test', control: 'someControl' } ] });

    // Routing that control should go to the test action
    var routedTo = defaultRouter.actionForInput({ device: 'test', control: 'someControl' });
    assert.ok(routedTo === 'testAction', 'ControlMapsToAction');
});
