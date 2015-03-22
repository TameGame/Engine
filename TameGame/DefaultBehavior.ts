/// <reference path="Core/Core.ts" />
/// <reference path="Sprite/Sprite.ts" />
/// <reference path="Physics/Physics.ts" />
/// <reference path="Input/Input.ts" />
/// <reference path="Animation/Animation.ts" />
/// <reference path="Time/Time.ts" />
/// <reference path="Helper/Helper.ts" />

module TameGame {
    "use strict";

    //
    // This is where we describe the default behaviour of TameGame
    //
    // These functions can be overridden to replace these behaviors, either to create new
    // effects in a game or to quickly replace an entire module of functionality.
    //
    defaultBehavior = {
        // Any object with a sprite asset ID uses sprite rendering behavior (see Sprite/Render.ts)
        'tSpriteRender': spriteRenderBehavior,
    
        // Just render every object in the scene
        'tRenderer': renderAllTheThings,
        
        // Allow objects and scenes to have 'live' behavior
        'tLiveObjects': liveObjectBehavior,

        // Allows animations to be attached to objects
        'tObjectAnimation': objectAnimationBehavior,

        // Causes the physics behavior to occur on active scenes
        'tPhysics': generatePhysicsBehavior,
        
        // When the object's presence is updated, set its transformation matrix
        'tTransformationMatrix': setObjectTransformBehavior,
    
        // Objects are tracked in a quad tree in each scene
        'tSceneSpace': sceneSpaceBehavior,

        // Control input is routed using the standard behavior
        'tInput': defaultInputBehavior,

        // Clocks are run off the watchable events for scenes and the game by default
        'tClock': clockBehavior,

        // Helpers provide convenience functions that cut down on typing when setting things up
        'tHelper': helperBehavior
    }
}
