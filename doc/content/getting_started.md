---
title: Getting started
section: Introduction
order: 0.2
---
# Getting started

First you'll need to get hold of the TameGame files. There are two that'll you'll need:
`TameGame.js` and `TameLaunch.js`. Right now, the way to do this is to follow the instructions
in [Building from Source](building.html).

Once you have these files, create a new directory for your project and copy them into it. Now
create a `index.html` file. This is used to run your new game and display it in a browser. A
minimal index file could look like this:

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="TameGame.js" type="text/javascript"></script>
    </head>
    <body>
    	<!-- The canvas is where the game will be drawn -->
        <canvas width=1280 height=720 id="testCanvas"></canvas>
        
        <!-- This javascript starts the game--> 
        <script type="text/javascript">
            var canvas = document.getElementById("testCanvas");
            var launched = TameGame.GameLauncher.launch('Game.js', 
                canvas, 
                { launchScript: "TameLaunch.js" });
        </script>
    </body>
</html>
```

The important parts here are the canvas, where the game is displayed, and the call to the 
launcher, which specifies the name of the JavaScript file with the implementation in it and
which canvas it should be run in.

The game itself is implemented in another javascript file. In this case, it's `Game.js`. When
running in browser, this is run as a webworker. A simple `Game.js` might look like this:

```javascript
// TameGame is loaded by the launcher, so the game and sprites are always available
var game    = TameGame.game;
var sprites = TameGame.sprites;

// Load a sprite file so we have something to display
var ballSprite = sprites.loadSprite('Ball.png');

// Create an object to represent this sprite
var ballObject = game.createObject();

// Set the sprite and put it in the center of the screen
ballObject.setup.sprite(ballSprite, .5, .5).moveTo(0, 0);

// Create a scene to display the sprite in
var scene = game.createScene();
scene.addObject(ballObject);

// Start the scene running
game.startScene(scene);
```

This is enough to display a simple sprite in the center of the screen. Create a 128x128 image
and call it `Ball.png` to give the game something to display (though you should get a
placeholder image even without it)

To try this out, you'll need to be running a webserver. The easiest way to do this is to
install `node.js` and then install `http-server` from the command line:

```bash
npm install -g http-server
```

Once this is done, you can start a server by using the command line to navigate to the directory
with your game in and using the following command:

```bash
http-server
```

You'll find the game running at `http://localhost:8080/`.
