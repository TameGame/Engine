#!/bin/sh

# Build main .js file
tsc -t ES5 --sourcemap --out TameGame.js TameGame.ts || exit 1

# Generate minified file
uglifyjs --screw-ie8 --source-map TameGame.min.js.map -c --lint -o TameGame.min.js TameGame.js
