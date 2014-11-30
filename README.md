TameGame Engine
===============

This is a 2D game engine written in TypeScript.

I'm writing this mainly for my own amusement, but also as the basis for some
actual game ideas.

Building
========

    npm install -g broccoli-cli
    npm install
    broccoli build dist

Status
======

We're right at the start of development!

The reason I'm writing my own engine and not using what already exists is
that I tried that and, at least for my ideas, found that a lot of the existing
engines needed to be pretty comprehensively torn apart in order to implement
the mechanics I wanted. So this is built around the idea of putting things
together.

The initial goal is to make something that renders via the WebGL, then to go 
for something a bit more ambitious by making the engine run stand-alone
using the v8 JavaScript engine.
