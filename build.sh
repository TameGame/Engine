#!/bin/sh

# Build main .js file
tsc -d -t ES5 --sourcemap --out TameGame.js TameGame.ts || exit 1
tsc -d -t ES5 --sourcemap --out TameLaunch.js TameLaunch.ts || exit 1

# Generate minified file
uglifyjs --screw-ie8 --source-map TameGame.min.js.map -c --lint -o TameGame.min.js TameGame.js || exit 1
uglifyjs --screw-ie8 --source-map TameLaunch.min.js.map -c --lint -o TameLaunch.min.js TameLaunch.js || exit 1
