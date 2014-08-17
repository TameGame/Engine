var game        = TameGame.game;
var sprites     = TameGame.sprites;
var data        = TameGame.data;

// Load a sprite
var rotation    = 0;
var spriteIds   = TameGame.loadTpJsonSpriteSheet(sprites, data, 'Sprites/SpriteSheet.json').then(function (spriteIds) {
    var someSprite  = spriteIds['TameGame.png'];

    // Set up the camera every time we get a render
    game.events.onRender(function(queue) {
        queue.moveCamera(-1, { x:0, y: 0 }, 4.0, rotation);
    });

    // Create a sprite object
    var spriteObject = game.createObject();
    spriteObject.get(TameGame.Sprite).assetId = someSprite;
    spriteObject.get(TameGame.Position).set({
        zIndex: 0,
        x1: -1, y1: 1,
        x2: 1,  y2: 1,
        x3: -1, y3: -1,
        x4: 1,  y4: -1
    });

    // Put it in a scene
    var scene = game.createScene();
    scene.addObject(spriteObject);

    game.startScene(scene);

    // Update the rotation during the animation pass
    scene.events.onPassStart(TameGame.UpdatePass.Animations, function (pass, milliseconds) {
        rotation = (milliseconds/10000)*360;
    });
});
