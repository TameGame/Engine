var game        = TameGame.game;
var sprites     = TameGame.sprites;
var data        = TameGame.data;

// Load a sprite
var spriteIds   = TameGame.loadTpJsonSpriteSheet(sprites, data, 'Sprites/SpriteSheet.json').then(function (spriteIds) {
    var someSprite  = spriteIds['TameGame.png'];

    // Create a sprite object
    function createSprite() {
        var spriteObject = game.createObject();
        spriteObject.sprite.assetId = someSprite;
        spriteObject.position = {
            zIndex: 0,
            x1: -1, y1: 1,
            x2: 1,  y2: 1,
            x3: -1, y3: -1,
            x4: 1,  y4: -1
        };
        
        var spriteShape = new TameGame.Polygon([ { x:-1, y:1 }, { x:1, y:1 }, { x:1,y:-1 }, { x:-1,y:-1 } ]);
        spriteObject.presence.shape = spriteShape;
        
        return spriteObject;
    }
    
    var spriteObject = createSprite();
    var secondObj = createSprite();
    
    // Rotate at 20 degress/second
    spriteObject.motion.rotationVelocity = 20.0;
    
    secondObj.presence.location = { x: -5, y: 0 };
    //secondObj.motion.rotationVelocity = 10.0;
    secondObj.motion.velocity = { x: 0.5, y: 0 };
    secondObj.presence.rotation = 45;
    
    spriteObject.collisionPriority = -1;

    // Allow the user to change the second object's velocity
    var wasd = { 
        up: [ { device: TameGame.controlDevice.keyboard, control: 'W' } ],
        down: [ { device: TameGame.controlDevice.keyboard, control: 'S' } ],
        left: [ { device: TameGame.controlDevice.keyboard, control: 'A' } ],
        right: [ { device: TameGame.controlDevice.keyboard, control: 'D' } ]
    };

    game.controlRouter.addControlBinding(wasd);

    game.controlEvents.onDuringAction('up', function () { secondObj.motion.velocity.y += 0.02; });
    game.controlEvents.onDuringAction('down', function () { secondObj.motion.velocity.y -= 0.02; });
    game.controlEvents.onDuringAction('left', function () { secondObj.motion.velocity.x -= 0.02; });
    game.controlEvents.onDuringAction('right', function () { secondObj.motion.velocity.x += 0.02; });

    // Put it in a scene
    var scene = game.createScene();
    scene.addObject(spriteObject);
    scene.addObject(secondObj);
    
    scene.camera = { center: { x: 0, y: 0 }, height: 4.0, rotation: 0 };

    game.startScene(scene);
});
