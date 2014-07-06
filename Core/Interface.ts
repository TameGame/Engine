//
// Callback made when a property changes
//
interface PropertyChangedCallback<TPropertyType> {
    (obj: TameObject, newValue: TPropertyType): void;
}

//
// The passes used for every game tick (in execution order)
//
enum UpdatePass {
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
interface Watchable {
    //
    // When any any object with an attached property of the specified
    // type detects that the contents of that property has changed,
    // call the specified callback.
    //
    // Returns a value that can be passed to unwatch to stop the property
    // from being watched.
    //
    // Watch notifications are generally nopt 
    //
    watch<TPropertyType>(updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>): number;

    //
    // Clears a previous watch event
    //
    unwatch(watchHandle: number);
}

//
// A TameObject provides the base functionality for all game objects
//
interface TameObject extends Watchable {
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
interface Scene extends Watchable {
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
interface Game extends Watchable {
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
}
