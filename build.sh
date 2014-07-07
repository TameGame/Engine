#!/bin/sh

# Build main .js file
tsc --out TameGame.js TameGame.ts

# Generate minified file
uglifyjs --source-map TameGame.min.js.map -c --lint -o TameGame.min.js TameGame.js
