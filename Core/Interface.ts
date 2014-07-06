//
// A TameObject provides the base functionality for all game objects
//
interface TameObject {
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
// The Game interface defines the top-level structures and routines used
// by the runtime.
//
interface Game {
    //
    // Creates a new TameObject that will participate in this game
    //
    createObject(): TameObject;
}
