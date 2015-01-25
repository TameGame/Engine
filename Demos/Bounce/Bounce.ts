/// <reference path="TameGame.d.ts" />

module TameGame {
    // Add an 'isBall' property to the TameObject type
    export interface TameObject {
        isBall?: boolean;
    }
}

module Bounce {
    "use strict";

    var game        = TameGame.game;
    var sprites     = TameGame.sprites;
    var data        = TameGame.data;

    // Start off by loading the ball image
    var ballSprite = sprites.loadSprite('Ball.png');

    // Create a shape for the ball so we can perform collision detection
    var ballRadius = 0.25;
    var ballShape = new TameGame.Circle({ x: 0, y: 0 }, ballRadius);

    // Function to create a ball object
    function createBall() {
        var newBall = game.createObject();

        // Set up the ball with the specified size and shape
        newBall.setup
            .sprite(ballSprite, ballRadius*2, ballRadius*2)
            .shape(ballShape);

        // Mark as a ball for the collision resolution algorithm
        newBall.isBall = true;

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

        newWall.setup
            .size(width, height)
            .moveTo(position.x, position.y)
            .useBasicShape();

        return newWall;
    }

    // Picks a velocity for a collision with a particular MTV
    function pickNewVelocity(mtv: TameGame.Point2D, velocity: TameGame.Point2D) : TameGame.Point2D {
        while (TameGame.dot(mtv, velocity) > 0 || TameGame.magnitude(velocity) < .5) {
            // Change the direction of this ball
            velocity = {
                x: Math.random()*4-2,
                y: Math.random()*4-2
            };
        }

        return velocity;
    }

    // Define what happens when things collide with each other in the bounce scene
    // (Demonstrates how to complete customise how collisions affect a scene)
    var addVector = TameGame.addVector;
    bounceScene.behavior.shapeCollision.resolveShapeCollisions = (left: TameGame.TameObject[], right: TameGame.TameObject[], collision: TameGame.Collision[]) => {
        // Resolve the collisions
        for (var index=0; index<left.length; ++index) {
            // Details of this collision
            var leftObj     = left[index];
            var rightObj    = right[index];
            var collide     = collision[index];

            // Ignore collisions between two things that aren't balls
            if (!leftObj.isBall && !rightObj.isBall) {
                continue;
            }

            // Work out how far the objects move
            var leftMtv = collide.getMtv();
            var rightMtv = { x: -leftMtv.x, y: -leftMtv.y };

            if (leftObj.isBall && rightObj.isBall) {
                // Both are balls: move them apart by an equal amount
                leftMtv.x /= 2.0; rightMtv.x /= 2.0;
                leftMtv.y /= 2.0; rightMtv.y /= 2.0;
            } else if (!leftObj.isBall) {
                // Hit a wall on the left (walls don't move)
                leftMtv = { x: 0, y: 0 };
            } else if (!rightObj.isBall) {
                // Hit a wall on the right (walls don't move)
                rightMtv = { x: 0, y: 0 };
            }

            // Move the items apart
            leftObj.location.pos = addVector(leftObj.location.pos, leftMtv);
            rightObj.location.pos = addVector(rightObj.location.pos, rightMtv);

            // Decide on a new velocity for both items
            leftObj.motion.velocity = pickNewVelocity(leftObj.motion.velocity, leftMtv);
            rightObj.motion.velocity = pickNewVelocity(rightObj.motion.velocity, rightMtv);
        }
    };

    // Walls around the edges
    bounceScene.addObject(createWall({ x: 0, y: 7 }, { width: 22, height: 2 }));
    bounceScene.addObject(createWall({ x: 0, y: -7}, { width: 22, height: 2 }));
    bounceScene.addObject(createWall({ x: -11.2, y: 0 }, { width: 2, height: 12 }));
    bounceScene.addObject(createWall({ x: 11.2, y: 0 }, { width: 2, height: 12 }));

    // Generate 10 balls every second (up to 240)
    var numBalls = 0;
    bounceScene.clock.every(() => {
        if (numBalls > 240) {
            return;
        }

        var ball = createBall();

        // Place it at a random point
        ball.setup.moveTo(Math.random()*10-5, Math.random()*10-5);

        // Start it moving in a random direction
        ball.motion.velocity = { x: Math.random()*4-2, y: Math.random()*4-2 };

        // Add to the scene
        bounceScene.addObject(ball);
        ++numBalls;

        if (numBalls % 20 === 0) {
            console.log(numBalls + " balls");
        }
    }, 100);

    // Run the scene that we just created in the game
    game.startScene(bounceScene);
}
