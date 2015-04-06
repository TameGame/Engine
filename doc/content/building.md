---
title: Building from source
section: Introduction
order: 0.1
---
# Building from source

## Requirements

To get the latest version of TameGame, you'll need to build it from source. Before you can
do that, you'll need to install some tools: node.js, git and gulp.

node.js can be installed from [nodejs.org](http://nodejs.org). You can check what version is installed by
entering the following at the command line:

    node --version

git is a command-line tool for tracking source code versions, and is available in several
forms. The [SourceTree](http://sourcetreeapp.com/) user interface is a convenient way to 
install and use it for those that are unfamiliar.

Finally, you'll need gulp to actually build TameGame. This is installed from the command
line after installing node using the following command:

    npm install -g gulp

You can check it's installed with the following command:

    gulp --version

## Building

Once the requirements are met, you can build TameGame. Use the git tool to clone the
engine repository from `https://github.com/TameGame/Engine.git` into a new folder.
Bring up the command line and navigate to that folder and run the following commands:

	npm install
	gulp

`npm install` installs everything needed to perform the build and `gulp` actually builds
the engine. It will create a `build` directory with everything in it.

You can also use gulp to run a webserver. Due to the way that most browsers work, you'll
need to run the demos from a webserver rather than by loading the local files. To do this,
run the following command from the engine folder:

    gulp serve

You should now be able to use a browser to see the demos by going to 
`localhost:4200/Demos/Bounce/index.html`
