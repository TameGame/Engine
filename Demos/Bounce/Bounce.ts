/// <reference path="TameGame.d.ts" />

module Bounce {
    var game        = TameGame.game;
    var sprites     = TameGame.sprites;
    var data        = TameGame.data;

    // Start off by loading the ball image
    var ballSprite = sprites.loadSprite('Ball.png');

    // Create a shape for the ball so we can perform collision detection
    var ballShape = new TameGame.Circle({ x: 0, y: 1 }, 1);

    // Function to create a ball object
    function createBall() {
        var newBall = game.createObject();

        // Image to use for this item is the ball
        newBall.sprite.assetId = ballSprite;

        // The position describes where to render the ball relative to its presence
        newBall.position = {
            zIndex: 0,
            quad: { 
                x1: -1, y1: 1,
                x2: 1,  y2: 1,
                x3: -1, y3: -1,
                x4: 1,  y4: -1
            }
        };

        // Give it a shape for collision detection purposes
        newBall.presence.shape = ballShape;

        // This is the result
        return newBall;
    }

    // Set up a new scene
    var bounceScene = game.createScene();

    // The camera describes how the scene coordinates map to the screen
    bounceScene.camera = { center: { x:0, y: 0 }, height: 12.0, rotation: 0 };

    // Create some walls at the edge of the scene
    function createWall(position: TameGame.Point2D, size: TameGame.Size) {
        var newWall = game.createObject();
        var width = size.width;
        var height = size.height;

        newWall.presence.location   = position;
        newWall.presence.shape      = new TameGame.Polygon([
            { x: -width/2.0, y: -height/2.0 },
            { x: width/2.0, y: -height/2.0 },
            { x: width/2.0, y: height/2.0 },
            { x: -width/2.0, y: height/2.0 } ]);

        return newWall;
    }

    // Walls around the edges
    bounceScene.addObject(createWall({ x: 0, y: 7 }, { width: 16, height: 2 }));
    bounceScene.addObject(createWall({ x: 0, y: -7}, { width: 16, height: 2 }));
    bounceScene.addObject(createWall({ x: -8, y: 0 }, { width: 2, height: 12 }));
    bounceScene.addObject(createWall({ x: 8, y: 0 }, { width: 2, height: 12 }));

    // Generate some balls
    for (var x = 0; x<10; ++x) {
        var ball = createBall();

        // Place it at a random point
        ball.presence.location = { x: Math.random()*10-5, y: Math.random()*10-5 };

        // Start it moving in a random direction
        ball.motion.velocity = { x: Math.random()*2, y: Math.random()*2 };

        // Add to the scene
        bounceScene.addObject(ball);
    }

    // Run the scene that we just created in the game
    game.startScene(bounceScene);
}
