/// <reference path="Interface.ts" />
/// <reference path="../Core/Core.ts" />

module TameGame {
    export interface TameObject {
        /**
         * Registers an animation for this object
         *
         * Each object may have any number of animations attached to it. They only run when the object is 'live' in a scene;
         * objects that have any animations attached to them will immediately become 'live'
         *
         * Once attached, animations can generally only be detached by replacing them or when they finish.
         */
         addAnimation?: (name: string, animation: Animation) => void;

         /**
          * Retrieves the animation attached to this object with the specified name (null if no animation is attached to this name)
          */
         getAnimation?: (name: string) => Animation;

         /**
          * Causes all of the animations attached to this object to advance
          */
         tickAnimations?: (milliseconds: number) => void;
    }

    /** Maps animation names to animation objects */
    interface AnimationMap {
        [name: string]: Animation;
    }

    /**
     * Attaches the standard animated object behavior to a game object
     */
    export function objectAnimationBehavior(game: Game) {
        // When an object is created, add the animation functions to it
        game.events.onCreateObject((obj) => {
            // The animations attached to this object
            var animations: AnimationMap = {};

            // Ticks the animations for an object
            var tickAnimations = (milliseconds: number) => {
                Object.keys(animations).forEach(animationName => animations[animationName].tick(milliseconds));
            };

            // Retrieves an animation if it exists in the list
            var getAnimation = (name: string) => {
                if (name in animations) {
                    return animations[name];
                } else {
                    return null;
                }
            }

            // Adds an animation to an object
            var addAnimation = (name: string, animation: Animation) => {
                // Store as an animation for this object
                animations[name] = animation;

                // Remove the animation when it finishes
                animation.onFinish(() => {
                    if (animations[name] === animation) {
                        delete animations[name];
                    }
                });

                // Objects with animations become alive
                obj.aliveStatus.isAlive = true;
            }

            obj.addAnimation    = addAnimation;
            obj.getAnimation    = getAnimation;
            obj.tickAnimations  = tickAnimations;
        });
    }
}
