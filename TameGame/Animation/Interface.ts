module TameGame {
    /** Function definition representing an action registered to an animation */
    export interface AnimationAction {
        (progress: number, milliseconds: number): void;
    }


    /**
     * Basic properties that can be used to describe an animation
     *
     * Most animation classes should support these properties
     */
    export interface AnimationProperties {
        /** Length of time this animation should take (milliseconds) */
        duration?: number;

        /** Set to true if this animation should run repeatedly until finish() is called */
        repeat?: boolean;
    }

    /**
     * Interface implemented by objects representing an animation
     */
    export interface Animation {
        /**
         * Specifies the start time for this animation (milliseconds, from a global clock)
         */
        start(milliseconds: number): void;

        /** 
         * Updates the objects controlled by this animation to the specified time (milliseconds, from a global clock)
         */
        tick(milliseconds: number): void;

        /**
         * Performs an action when this animation reaches its transition point (the point at which it can be replaced by another animation)
         */
        onTransition(action: AnimationAction): void;

        /**
         * Performs an action after this animation has finished
         */
        onFinish(action: AnimationAction): void;

        /**
         * If this is a repeating animation, runs until the final frame and then stops
         */
        finish(): void;
    }
}