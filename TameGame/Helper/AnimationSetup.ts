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
         * Note that if the object is not part of a scene, no delay will be applied to the animation
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
            // Settings for this object
            var _duration               = 500.0;
            var _delay                  = 0.0;
            var _to: Point2D            = null;
            var _path: Path             = null;
            var _targetAngle: number    = null;
            var _easeIn                 = 0.0;
            var _easeOut                = 0.0;

            // Function declarations
            function to(where: Point2D) {
                _to = where;
                return this;
            }

            function followPath(path: Path) {
                _path = path;
                return this;
            }

            function rotate(newAngle: number) {
                _targetAngle = newAngle;
                return this;
            }

            function delay(milliseconds: number) {
                _delay = milliseconds;
                return this;
            }

            function duration(milliseconds: number) {
                _duration = milliseconds;
                return this;
            }

            function easeIn(proportion?: number) {
                if (typeof proportion === 'undefined') {
                    proportion = 0.5;
                }
                _easeIn = proportion;
                return this;
            }

            function easeOut(proportion?: number) {
                if (typeof proportion === 'undefined') {
                    proportion = 0.5;
                }
                _easeOut = proportion;
                return this;
            }

            function start() {
                return new Promise<void>((resolve, reject) => {
                    // Generate an easing function
                    var easing: (proportion: number) => number;

                    if (_easeIn > 0.0 && _easeOut > 0.0) {
                        easing = createEasingFunction.inOut(_easeIn, 1.0-_easeOut);
                    } else if (_easeIn > 0.0) {
                        easing = createEasingFunction.in(_easeIn);
                    } else if (_easeOut > 0.0) {
                        easing = createEasingFunction.out(1.0-_easeOut);
                    } else {
                        easing = proportion => proportion;
                    }

                    // Also need a rotation function
                    var rotate: (prop) => void;

                    if (_targetAngle !== null) {
                        var sourceAngle = obj.location.angle;
                        var angleDiff   = _targetAngle - sourceAngle;
                        rotate = (proportion) => {
                            obj.location.angle = sourceAngle + (angleDiff*proportion);
                        };
                    } else {
                        rotate = () => {};
                    }

                    // Finally, the animation itself
                    var animation = new SmoothAnimation(0, 1, { easing: easing, duration: _duration });
                    if (_path) {
                        animation.onFrame((proportion) => {
                            obj.location.pos = _path.pointAt(proportion);
                            rotate(proportion);
                        });
                    } else if (_to !== null) {
                        var startPos    = obj.location.pos;
                        var diff        = subtractVector(_to, startPos);

                        animation.onFrame((proportion) => {
                            obj.location.pos = { 
                                x: startPos.x + diff.x*proportion,
                                y: startPos.y + diff.y*proportion
                            }
                            rotate(proportion);
                        });
                    }

                    animation.onFinish(() => resolve());

                    // Start the animation
                    if (_delay !== null && obj.scene) {
                        obj.scene.clock.after(_delay).then(() => obj.animations.addAnimation("animationSetup", animation));
                    } else {
                        obj.animations.addAnimation("animationSetup", animation);
                    }
                });
            }

            // Finish setup
            this.to         = to;
            this.followPath = followPath;
            this.rotate     = rotate;
            this.delay      = delay;
            this.duration   = duration;
            this.easeIn     = easeIn;
            this.easeOut    = easeOut;
            this.start      = start;
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
