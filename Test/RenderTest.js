var game        = TameGame.game;
var sprites     = TameGame.sprites;
var data        = TameGame.data;

// Load a sprite
var spriteIds   = TameGame.loadTpJsonSpriteSheet(sprites, data, 'Sprites/SpriteSheet.json').then(function (spriteIds) {
    var someSprite  = spriteIds['TameGame.png'];

    // Create a sprite object
    function createSprite() {
        var spriteObject = game.createObject();
        spriteObject.get(TameGame.Sprite).assetId = someSprite;
        spriteObject.get(TameGame.Position).set({
            zIndex: 0,
            x1: -1, y1: 1,
            x2: 1,  y2: 1,
            x3: -1, y3: -1,
            x4: 1,  y4: -1
        });
        
        var spriteShape = new TameGame.Polygon([ { x:-1, y:1 }, { x:1, y:1 }, { x:1,y:-1 }, { x:-1,y:-1 } ]);
        spriteObject.get(TameGame.Presence).shape = spriteShape;
        
        return spriteObject;
    }
    
    var spriteObject = createSprite();
    
    // Rotate at 20 degress/second
    spriteObject.get(TameGame.Motion).rotationVelocity = 20.0;

    // Put it in a scene
    var scene = game.createScene();
    scene.addObject(spriteObject);
    
    scene.camera = { center: { x: 0, y: 0 }, height: 4.0, rotation: 0 };

    game.startScene(scene);
});
