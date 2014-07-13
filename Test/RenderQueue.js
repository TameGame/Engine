QUnit.test("CanQueueItem", function(assert) {
    var renderQueue = new TameGame.StandardRenderQueue();
    renderQueue.addItem({ zIndex: 0, action: "Test" });
    
    var itemCount = 0;
    renderQueue.render(function () { itemCount++; });
    assert.ok(itemCount === 1, "Item found");
});

QUnit.test("CanClearItems", function(assert) {
    var renderQueue = new TameGame.StandardRenderQueue();
    renderQueue.addItem({ zIndex: 0, action: "Test" });
    renderQueue.clearQueue();
    
    var itemCount = 0;
    renderQueue.render(function () { itemCount++; });
    assert.ok(itemCount === 0, "Queue is empty");
});

QUnit.test("OrderByZIndex", function(assert) {
    var renderQueue = new TameGame.StandardRenderQueue();
    renderQueue.addItem({ zIndex: 0, action: "Test" });
    renderQueue.addItem({ zIndex: 2, action: "Test" });
    renderQueue.addItem({ zIndex: 1, action: "Test" });
    
    var itemCount = 0;
    var lastZIndex = -1;
    renderQueue.render(function (item) { 
        assert.ok(item.zIndex > lastZIndex, "Item " + (itemCount+1) + " is ordered properly (" + item.zIndex + ")");
        lastZIndex = item.zIndex;
        itemCount++; 
    });
    assert.ok(itemCount === 3, "Found all items");
});

QUnit.test("StableWhenZTheSame", function(assert) {
    var renderQueue = new TameGame.StandardRenderQueue();
    
    // The intValues value indicates the expected ordering
    renderQueue.addItem({ zIndex: 0, intValues: [0], action: "Test" });
    renderQueue.addItem({ zIndex: 1, intValues: [3], action: "Test" });
    renderQueue.addItem({ zIndex: 1, intValues: [4], action: "Test" });
    renderQueue.addItem({ zIndex: 1, intValues: [5], action: "Test" });
    renderQueue.addItem({ zIndex: 0, intValues: [1], action: "Test" });
    renderQueue.addItem({ zIndex: 0, intValues: [2], action: "Test" });
    
    var itemCount = 0;
    var lastIndex = -1;
    renderQueue.render(function (item) { 
        var ourIndex = item.intValues[0];
        
        assert.ok(ourIndex > lastIndex, "Item " + (itemCount+1) + " is ordered properly (" + ourIndex + ")");
        lastIndex = ourIndex;
        itemCount++; 
    });
    assert.ok(itemCount === 6, "Found all items");
});
