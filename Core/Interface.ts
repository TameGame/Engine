module TameGame {
    //
    // Callback made when a property changes
    //
    export interface PropertyChangedCallback<TPropertyType> {
        (obj: TameObject, newValue: TPropertyType): void;
    }

    //
    // Interface implemented by objects that can cancel something like
    // a previously set up watch.
    //
    export interface Cancellable {
        cancel(): void;
    }

    //
    // The passes used for every game tick (in execution order)
    //
    export enum UpdatePass {
        // Not a pass: indicates events that must be generated immediately
        Immediate,

        // The animation pass, when animated properties are updated
        Animations,

        // The mechanics pass, when the effects of game mechanics on properties are processed
        Mechanics,

        // The physics pass, when the effects of any physics engine are applied
        Physics,

        // The pre-render update pass
        PreRender,

        // The render pass, when the render queue for the tick is 
        // generated.
        Render,

        // The post-render pass, after the render queue has been
        // passed off
        PostRender
    }

    //
    // A watchable object can generate callbacks when properties that are
    // attached to it or its child objects change
    //
    export interface Watchable {
        //
        // When any any object with an attached property of the specified
        // type detects that the contents of that property has changed,
        // call the specified callback.
        //
        // Returns a value that can be used to cancel the watch.
        //
        // Watch notifications are generally not called immediately but when
        // a particular update pass is hit during a game tick.
        //
        watch<TPropertyType>(updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>): Cancellable;

        //
        // When this object is part of the active scene and the game hits
        // the specified pass as part of processing a tick, the callback
        // is called, once only.
        //
        onPass(updatePass: UpdatePass, callback: (milliseconds: number) => void);

        //
        // As for onPass, but the call is made every time this object is part
        // of the active scene and the game hits the specified pass.
        //
        everyPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) : Cancellable;
    }

    //
    // A TameObject provides the base functionality for all game objects
    //
    export interface TameObject /* extends Watchable */ {
        //
        // Retrieves this object's implementation of a particular property
        // interface.
        //
        // If this object does not yet have properties of the specified
        // type, then the properties are registered with their default
        // values.
        //
        // Behind the scenes, property objects are made 'watchable' so that
        // updates to properties causes appropriate side-effects elsewhere
        // in the game engine.
        //
        // Property objects can't be replaced.
        //
        get<TPropertyType>(): TPropertyType;

        //
        // Retrieves this object's implementation of a particular behaviour
        // interface. If no behaviour has been set, then this will return
        // the default value for this object.
        //
        // Behaviours are how objects send messages to one another.
        //
        getBehavior<TBehaviorType>(): TBehaviorType;

        //
        // Attaches a behaviour to this object, replacing whatever was
        // there before.
        //
        // This function returns the object it was called on: this allows
        // for chained attaches.
        //
        attachBehavior<TBehaviorType>(behavior: TBehaviorType): TameObject;
    }

    //
    // A Scene is simply a collection of objects
    //
    // It represents a game state. That is, it encompasses a set of game
    // objects. A single scene can be active in a game at one time, though
    // this is not a huge limitation as scenes may contain sub-scenes.
    //
    // A scene can represent things like a level, a HUD or a loading screen.
    //
    export interface Scene /* extends Watchable */ {
        //
        // Adds an object to this scene
        //
        // Objects can only be in a single scene at a time.
        // Objects must have been created by the same Game that created this object
        // Returns this scene to allow for chaining
        //
        addObject(o: TameObject): Scene;

        //
        // Removes an object from this scene
        //
        removeObject(o: TameObject): Scene;

        //
        // Adds a sub-scene to this object
        //
        // Sub-scenes must have been created by the same Game that created this object
        // Returns this scene to allow for chaining
        //
        addScene(newScene: Scene): Scene;

        //
        // Removes a sub-scene from this object
        //
        removeScene(oldScene: Scene): Scene;
    }

    //
    // The Game interface defines the top-level structures and routines used
    // by the runtime.
    //
    export interface Game /* extends Watchable */ {
        //
        // Creates a new TameObject that will participate in this game
        //
        createObject(): TameObject;

        //
        // Creates a new scene
        //
        createScene(): Scene;

        //
        // Starts running the specified scene
        //
        startScene(scene: Scene): void;

        //
        // Runs a game tick. Time is a time in milliseconds from an arbitrary
        // fixed point (it should always increase)
        //
        // Normally you don't need to call this manually, the game launcher
        // will set things up so that it's called automatically.
        //
        // It's a good idea to choose a fixed point that's reasonably recent
        // so that time can be measured to a high degree of accuracy.
        //
        tick(milliseconds: number): void;
    }
}
