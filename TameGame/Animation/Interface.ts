module TameGame {
    /** Function definition representing an action registered to an animation */
    export interface AnimationAction {
        (progress: number, milliseconds: number): void;
    }

    export interface FrameAction<TFrameData> {
        (frame: TFrameData, progress: number, milliseconds: number): void;
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
        onTransition(action: AnimationAction): Animation;

        /**
         * Performs an action after this animation has finished
         */
        onFinish(action: AnimationAction): Animation;

        /**
         * If this is a repeating animation, runs until the final frame and then stops
         */
        finish(): void;
    }

    /** 
     * Interface implemented by objects that can generate a callback every time a new animation frame is required
     */
    export interface AnimationWithCallback<TFrameData> extends Animation {
        /**
         * Performs an action when this animation reaches its transition point (the point at which it can be replaced by another animation)
         */
        onTransition(action: AnimationAction): AnimationWithCallback<TFrameData>;

        /**
         * Performs an action after this animation has finished
         */
        onFinish(action: AnimationAction): AnimationWithCallback<TFrameData>;

        /** 
         * Specifies a callback to be made whenever it's time to generate a new animation frame
         */
        onFrame(action: FrameAction<TFrameData>): AnimationWithCallback<TFrameData>;
    }
}
