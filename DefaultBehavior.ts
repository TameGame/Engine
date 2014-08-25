/// <reference path="Core/Core.ts" />
/// <reference path="Sprite/Sprite.ts" />
/// <reference path="Physics/Physics.ts" />

module TameGame {
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
    
        // Objects that have Motion should become alive and move
        'tSimpleMotion': simpleMotionBehavior
    }
}
