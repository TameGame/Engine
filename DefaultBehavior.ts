/// <reference path="Core/Core.ts" />
/// <reference path="Sprite/Sprite.ts" />

module TameGame {
    //
    // This is where we describe the default behaviour of TameGame
    //
    // These functions can be overridden to replace these behaviors, either to create new
    // effects in a game or to quickly replace an entire module of functionality.
    //
    defaultBehavior = {
        'tSpriteRender': spriteRenderBehavior
    }
}
