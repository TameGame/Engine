/// <reference path="TameGame.d.ts" />

module Bounce {
    var game        = TameGame.game;
    var sprites     = TameGame.sprites;
    var data        = TameGame.data;

    // Start off by loading the ball image
    var ballSprite = sprites.loadSprite('Ball.png');

    // Create a shape for the ball so we can perform collision detection
    var ballRadius = 0.25;
    var ballShape = new TameGame.Circle({ x: 0, y: 1 }, ballRadius);

    // Function to create a ball object
    function createBall() {
        var newBall = game.createObject();

        // Image to use for this item is the ball
        newBall.sprite.assetId = ballSprite;

        // The position describes where to render the ball relative to its presence
        newBall.position = {
            zIndex: 0,
            quad: { 
                x1: -ballRadius, y1: ballRadius,
                x2: ballRadius,  y2: ballRadius,
                x3: -ballRadius, y3: -ballRadius,
                x4: ballRadius,  y4: -ballRadius
            }
        };

        // Give it a shape for collision detection purposes
        newBall.presence.shape = ballShape;

        // Balls bounce off things that they collide with
        newBall.behavior.shapeCollision = {
            shapeCollision: (collision: TameGame.Collision, withObject: TameGame.TameObject, thisObject: TameGame.TameObject) => {
                // Get the 'minimum translation vector' for the collision
                var mtv = collision.getMtv();

                // Move this object away from the object it collided with
                var oldPos = newBall.presence.location;
                var newPos = {
                    x: oldPos.x + mtv.x/2,
                    y: oldPos.y + mtv.y/2
                };
                newBall.presence.location = newPos;

                // If the ball is not moving away from the point of collision, then make it bounce in a different direction
                var direction       = newBall.motion.velocity;
                if (TameGame.dot(mtv, direction) < 0) {
                    // Change the direction of this ball
                    newBall.motion.velocity = {
                        x: Math.random()*4-2,
                        y: Math.random()*4-2
                    };
                }

                // Returning false ensures the collision is processed for the other object too
                return false;
            }
        };


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

        // The wall just has a presence and location but no sprite
        newWall.presence.location   = position;
        newWall.presence.shape      = new TameGame.Polygon([
            { x: -width/2.0, y: -height/2.0 },
            { x: width/2.0, y: -height/2.0 },
            { x: width/2.0, y: height/2.0 },
            { x: -width/2.0, y: height/2.0 } ]);

        // It does nothing when collided with
        newWall.behavior.shapeCollision = {
            shapeCollision: (collision: TameGame.Collision, withObject: TameGame.TameObject, thisObject: TameGame.TameObject) => {
                return false;
            }
        };

        return newWall;
    }

    // Walls around the edges
    bounceScene.addObject(createWall({ x: 0, y: 7 }, { width: 22, height: 2 }));
    bounceScene.addObject(createWall({ x: 0, y: -7}, { width: 22, height: 2 }));
    bounceScene.addObject(createWall({ x: -10, y: 0 }, { width: 2, height: 12 }));
    bounceScene.addObject(createWall({ x: 10, y: 0 }, { width: 2, height: 12 }));

    // Generate 1 ball every second (up to 240)
    var numBalls = 0;
    bounceScene.clock.every(() => {
        if (numBalls > 240) {
            return;
        }

        var ball = createBall();

        // Place it at a random point
        ball.presence.location = { x: Math.random()*10-5, y: Math.random()*10-5 };

        // Start it moving in a random direction
        ball.motion.velocity = { x: Math.random()*4-2, y: Math.random()*4-2 };

        // Add to the scene
        bounceScene.addObject(ball);
        ++numBalls;

        if (numBalls % 20 === 0) {
            console.log(numBalls + " balls");
        }
    }, 1000);

    // Run the scene that we just created in the game
    game.startScene(bounceScene);
}
