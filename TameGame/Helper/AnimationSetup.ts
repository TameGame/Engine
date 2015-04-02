/// <reference path="../Animation/Animation.ts" />
/// <reference path="../Paths/Paths.ts" />

module TameGame {
    export interface TameObject {
        /**
         * Convienience methods for animating an object
         */
        animate: AnimationSetup;
    }

    /**
     * Interface implemented by objects that can help set up an animation for an object
     */
    export interface AnimationSetup {
        /** 
         * Starts this animation running
         *
         * Returns a promise for after the animation has finished
         */
        start(): Promise<void>;

        /**
         * Specifies where the object should move to
         *
         * Default is no movement
         */
        to(where: Point2D): AnimationSetup;

        /**
         * Specifies that a particular path should be followed
         */
        followPath(path: Path): AnimationSetup;

        /**
         * Specifies the angle to rotate to
         *
         * Default is to leave the angle the same
         */
        rotate(newAngle: number): AnimationSetup;

        /**
         * Specifies the delay before the animation starts
         *
         * Default is no delay
         */
        delay(milliseconds: number): AnimationSetup;

        /**
         * Specifies the duration of the animation
         * 
         * Default is 500ms
         */
        duration(milliseconds: number): AnimationSetup;

        /**
         * Specifies the ease-in proportion for this animation
         * 
         * Default is no ease-in (0). Not specifying the ease-in proportion sets it to 0.5
         */
        easeIn(proportion?: number): AnimationSetup;

        /**
         * Specifies the ease-out proportion for this animation
         *
         * Default is no ease-out (0). Not specifying the ease-out proportion sets it to 0.5
         */
        easeOut(proportion?: number): AnimationSetup;
    }

    /**
     * Represents an animation being built up by AnimationSetup
     */
    class BasicAnimationSetup implements AnimationSetup {
        constructor(obj: TameObject) {
            // TODO!
        }

        /** 
         * Starts this animation running
         *
         * Returns a promise for after the animation has finished
         */
        start: () => Promise<void>;

        /**
         * Specifies where the object should move to
         *
         * Default is no movement
         */
        to: (where: Point2D) => AnimationSetup;

        /**
         * Specifies that a particular path should be followed
         */
        followPath: (path: Path) => AnimationSetup;

        /**
         * Specifies the angle to rotate to
         *
         * Default is to leave the angle the same
         */
        rotate: (newAngle: number) => AnimationSetup;

        /**
         * Specifies the delay before the animation starts
         *
         * Default is no delay
         */
        delay: (milliseconds: number) => AnimationSetup;

        /**
         * Specifies the duration of the animation
         * 
         * Default is 500ms
         */
        duration: (milliseconds: number) => AnimationSetup;

        /**
         * Specifies the ease-in proportion for this animation
         * 
         * Default is no ease-in (0)
         */
        easeIn: (proportion?: number) => AnimationSetup;

        /**
         * Specifies the ease-out proportion for this animation
         *
         * Default is no ease-out (0)
         */
        easeOut: (proportion?: number) => AnimationSetup;
    }

    /**
     * Class providing support for an object's .animate field
     */
    export class ContextualAnimationSetup implements AnimationSetup {
        /** Context, set as part of a contextual field */
        _context: TameObject;

        /** 
         * Starts this animation running
         *
         * Returns a promise for after the animation has finished
         */
        start(): Promise<void> {
            return (new BasicAnimationSetup(this._context)).start();
        }

        /**
         * Specifies where the object should move to
         *
         * Default is no movement
         */
        to(where: Point2D): AnimationSetup {
            return (new BasicAnimationSetup(this._context)).to(where);
        }

        /**
         * Specifies that a particular path should be followed
         */
        followPath(path: Path): AnimationSetup {
            return (new BasicAnimationSetup(this._context)).followPath(path);
        }

        /**
         * Specifies the angle to rotate to
         *
         * Default is to leave the angle the same
         */
        rotate(newAngle: number): AnimationSetup {
            return (new BasicAnimationSetup(this._context)).rotate(newAngle);
        }

        /**
         * Specifies the delay before the animation starts
         *
         * Default is no delay
         */
        delay(milliseconds: number): AnimationSetup {
            return (new BasicAnimationSetup(this._context)).delay(milliseconds);
        }

        /**
         * Specifies the duration of the animation
         * 
         * Default is 500ms
         */
        duration(milliseconds: number): AnimationSetup {
            return (new BasicAnimationSetup(this._context)).duration(milliseconds);
        }

        /**
         * Specifies the ease-in proportion for this animation
         * 
         * Default is no ease-in (0)
         */
        easeIn(proportion?: number): AnimationSetup {
            return (new BasicAnimationSetup(this._context)).easeIn(proportion);
        }

        /**
         * Specifies the ease-out proportion for this animation
         *
         * Default is no ease-out (0)
         */
        easeOut(proportion?: number): AnimationSetup {
            return (new BasicAnimationSetup(this._context)).easeOut(proportion);
        }
    };
}
