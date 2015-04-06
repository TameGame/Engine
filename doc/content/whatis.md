---
title: What is a game engine?
section: Introduction
order: 0.05
---
# What is a game engine?

In software, the word 'engine' is traditionally overloaded to the point where it has no meaning, used as a
way to avoid having to think of a word for the congolmeration of 'stuff' that makes up the back end or
re-usable part of an application. It's used as a slightly less specific word for 'framework'.

A game engine is different; it deals with something that gives the word 'engine' meaning: time. A game engine
principally handles the passage of time and the events that happen as it passes, driving the game forward.

A game engine also typically provides a suite of other tools to help with building games. This can be very
helpful for developing games but it can also be a hinderance if the tools are not suited for a particular
type of game. This can cause bugs when the engine's design and the design of the game clash, or can cause
development to slow down because a whole chunk of the engine needs to be redesigned.

TameGame is designed to try to avoid this pitfall. It has a core consisting of just three types of object:
the game itself, scenes and objects. The game keeps track of everything and controls how events are sent
out. Scenes track collections of objects (and optionally other scenes) and give them a consistent behaviour.
Objects usually represent things that are displayed to the user or can be interacted with. Everything else - 
from rendering to input to physics - is implemented as extensions to these objects. Any default behavior
that is unsuited can be replaced. Each part is designed to be relatively small, so that replacements can
be implemented quickly when they are required.