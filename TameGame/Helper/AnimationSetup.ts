module TameGame {
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
         * Default is no ease-in (0)
         */
        easeIn(proportion?: number): AnimationSetup;

        /**
         * Specifies the ease-out proportion for this animation
         *
         * Default is no ease-out (0)
         */
        easeOut(proportion?: number): AnimationSetup;
    }
}
