#!/bin/sh

# Build main .js file
tsc --out TameGame.js TameGame.ts || exit 1

# Generate minified file
uglifyjs --source-map TameGame.min.js.map -c --lint -o TameGame.min.js TameGame.js
