QUnit.test("CanMapControlBindingsThroughDefaultRouter", function (assert) {
    // Simple router with a single control in it
    var defaultRouter = new TameGame.DefaultControlRouter();
    defaultRouter.addControlBinding({ testAction: [ { device: 'test', control: 'someControl' } ] });

    // Routing that control should go to the test action
    var routedTo = defaultRouter.actionForInput({ device: 'test', control: 'someControl '});
    console.log(routedTo);
    assert.ok(routedTo === 'testAction', 'ControlMapsToAction');
});
