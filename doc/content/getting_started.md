---
title: Getting started
section: Introduction
order: 0.2
---
# Getting started

First you'll need to get hold of the TameGame files. There are two that'll you'll need:
`TameGame.js` and `TameLaunch.js`. Right now, the way to do this is to follow the instructions
in [Building from Source](building.html).

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
            var launched = TameGame.GameLauncher.launch('Game.js', canvas, { launchScript: "TameLaunch.js" });
        </script>
    </body>
</html>
```
