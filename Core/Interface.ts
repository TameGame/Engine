/// <reference path="../RenderQueue/Interface.ts"/>

module TameGame {
    /**
     * Callback made when a property changes
     */
    export interface PropertyChangedCallback<TPropertyType> {
        (obj: TameObject, newValue: TPropertyType): void;
    }

    /**
     * Interface implemented by objects that can cancel something like
     * a previously set up watch.
     */
    export interface Cancellable {
        cancel(): void;
    }
    
    /**
     * Callback representing an event
     */
    export interface Event<TParameterType> {
        (param: TParameterType, millseconds: number): void;
    }
    
    /**
     * Callback representing an event that takes no parameter
     */
    export interface EventVoid {
        (milliseconds: number): void;
    }
    
    /**
     * Callback implemented by something that registers an event
     */
    export interface EventRegistration<TParameterType> {
        (callback: Event<TParameterType>): Cancellable;
    }
    
    /**
     * Callback implemented by something that registers an event that filters by a value
     */
    export interface FilteredEventRegistration<TFilterType, TParameterType> {
        (type: TFilterType, callback: Event<TParameterType>): Cancellable;
        (type: TFilterType[], callback: Event<TParameterType>): Cancellable;
    }

    /**
     * Callback representing an event
     */
    export interface FireFilteredEvent<TFilterType, TParameterType> {
        (filterVal: TFilterType, param: TParameterType, millseconds: number): void;
    }

    /**
     * Callback implemented by something that registers an event that takes no parameter
     */
    export interface EventRegistrationVoid {
        (callback: EventVoid): Cancellable;
    }

    /**
     * The passes used for every game tick (in execution order)
     */
    export enum UpdatePass {
        /** Not a pass: indicates events that must be generated immediately */
        Immediate,

        /** The animation pass, when animated properties are updated */
        Animations,

        /** The mechanics pass, when the effects of game mechanics on properties are processed */
        Mechanics,

        /** The physics pass, when the effects of any physics engine are applied */
        Physics,

        // The pre-render update pass
        PreRender,

        /** The render pass, when the render queue for the current tick is generated */
        Render,

        /** The post-render pass, after the render queue has been passed off */
        PostRender
    }
    
    /** The earliest update pass */
    export var firstUpdatePass = UpdatePass.Animations;

    /**
     * A type definition is used as a reference to a property or behaviour
     *
     * This is a bit of a hack. Typescript has no good way to create a function
     * that says 'take a type and return an object of that type' as it has
     * no type that itself represents a type.
     *
     * If it did, we could create a function that takes a type and returns
     * a typedefinition for it instead of having to define one manually every
     * time.
     */
    export interface TypeDefinition<TType> {
        // A unique name for this property (usually just the same as the name of the class)
        name: string;

        // Creates a new default value for this property
        createDefault(): TType;
    }

    /**
     * A watchable object can generate callbacks when properties that are
     * attached to it or its child objects change
     */
    export interface Watchable {
        /**
         * When any any object with an attached property of the specified
         * type detects that the contents of that property has changed,
         * call the specified callback.
         *
         * Returns a value that can be used to cancel the watch.
         *
         * Watch notifications are generally not called immediately but when
         * a particular update pass is hit during a game tick.
         */
        watch<TPropertyType>(definition: TypeDefinition<TPropertyType>, updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>): Cancellable;

        /**
         * When this object is part of the active scene and the game hits
         * the specified pass as part of processing a tick, the callback
         * is called, once only.
         */
        onPass(updatePass: UpdatePass, callback: (milliseconds: number) => void);

        /**
         * As for onPass, but the call is made every time this object is part
         * of the active scene and the game hits the specified pass.
         */
        everyPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) : Cancellable;
    }
    
    /**
     * A settable property is one which can replace its contents with the contents of another object
     *
     * This is used with the get operator for objects: it's often faster than setting all of the
     * values individually and can be more convenient for the larger property types.
     *
     * Calling set will also ensure that the immediate watchers are only fired once regardless
     * of how many property updates take place.
     */
    export interface SettableProperty<TPropertyType> {
        set(newValue: TPropertyType): void;
    }
    
    /**
     * The core events
     */
    export interface CoreEvents {
        /** Event fired when a pass starts */
        onPassStart: FilteredEventRegistration<UpdatePass, UpdatePass>;
        
        /** Event fired when a pass finishes */
        onPassFinish: FilteredEventRegistration<UpdatePass, UpdatePass>;
        
        /** Event fired when it's time to fill the render queue */
        onRender: EventRegistration<RenderQueue>;
    }
    
    /**
     * Events for the Game object
     */
    export interface GameEvents extends CoreEvents {
        /** The current scene has changed */
        onNewScene: EventRegistration<Scene>;
        
        /** A new scene has been created */
        onCreateScene: EventRegistration<Scene>;
        
        /** Event fired after the render pass has completed and it's time to actually render the contents of the queue */
        onPerformRender: EventRegistration<RenderQueue>;
    }
    
    /**
     * Events for the Scene object
     */
    export interface SceneEvents extends CoreEvents {
        /** An object has been added to this scene */
        onAddObject: EventRegistration<TameObject>;
        
        /** An object has been removed from this scene */
        onRemoveObject: EventRegistration<TameObject>;
        
        /** A new sub-scene has been added */
        onAddSubScene: EventRegistration<Scene>;
        
        /** A sub-scene has been removed */
        onRemoveSubScene: EventRegistration<Scene>;
    }

    /**
     * A TameObject provides the base functionality for all game objects
     */
    export interface TameObject /* extends Watchable */ {
        /**
         * An identifier for this object that is unique within the game
         */
        identifier: number;
        
        /**
         * Every object can belong to at most once scene
         */
        scene: Scene;

        /**
         * Retrieves this object's implementation of a particular property
         * interface.
         *
         * If this object does not yet have properties of the specified
         * type, then the properties are registered with their default
         * values.
         *
         * Behind the scenes, property objects are made 'watchable' so that
         * updates to properties causes appropriate side-effects elsewhere
         * in the game engine.
         *
         * Property objects can't be replaced.
         */
        get<TPropertyType>(definition: TypeDefinition<TPropertyType>): TPropertyType;

        /**
         * Retrieves this object's implementation of a particular behaviour
         * interface. If no behaviour has been set, then this will return
         * the default value for this object.
         *
         * Behaviours are how objects send messages to one another.
         */
        getBehavior<TBehaviorType>(definition: TypeDefinition<TBehaviorType>): TBehaviorType;

        /**
         * Attaches a behaviour to this object, replacing whatever was
         * there before.
         *
         * This function returns the object it was called on: this allows
         * for chained attaches.
         */
        attachBehavior<TBehaviorType>(definition: TypeDefinition<TBehaviorType>, behavior: TBehaviorType): TameObject;
    }

    /**
     * A Scene is simply a collection of objects
     *
     * It represents a game state. That is, it encompasses a set of game
     * objects. A single scene can be active in a game at one time, though
     * this is not a huge limitation as scenes may contain sub-scenes.
     *
     * A scene can represent things like a level, a HUD or a loading screen.
     */
    export interface Scene extends Watchable {
        /**
         * A unique ID for this scene within the game
         */
        identifier: number;

        /**
         * Adds an object to this scene
         *
         * Objects can only be in a single scene at a time.
         * Objects must have been created by the same Game that created this object
         * Returns this scene to allow for chaining
         */
        addObject(o: TameObject): Scene;

        /**
         * Removes an object from this scene
         */
        removeObject(o: TameObject): Scene;

        /**
         * Adds a sub-scene to this object
         *
         * Sub-scenes must have been created by the same Game that created this object
         * Returns this scene to allow for chaining
         */
        addScene(newScene: Scene): Scene;

        /**
         * Removes a sub-scene from this object
         */
        removeScene(oldScene: Scene): Scene;
        
        /**
         * Performs an action for all objects in this scene
         */
        forAllObjects(callback: (obj: TameObject) => void);
        
        /**
         * Performs an action for all subscenes of this scene
         */
        forAllSubscenes(callback: (scene: Scene) => void);
        
        /**
         * Events attached to this scene
         */
        events: SceneEvents;
    }

    /**
     * The Game interface defines the top-level structures and routines used
     * by the runtime.
     */
    export interface Game extends Watchable {
        /**
         * Creates a new TameObject that will participate in this game
         */
        createObject(): TameObject;

        /**
         * Creates a new scene
         */
        createScene(): Scene;

        /**
         * Starts running the specified scene
         */
        startScene(scene: Scene): void;

        /**
         * Runs a game tick. Time is a time in milliseconds from an arbitrary
         * fixed point (it should always increase)
         *
         * Normally you don't need to call this manually, the game launcher
         * will set things up so that it's called automatically.
         *
         * It's a good idea to choose a fixed point that's reasonably recent
         * so that time can be measured to a high degree of accuracy.
         */
        tick(milliseconds: number): void;
        
        /**
         * The events for this object
         */
        events: GameEvents;
    }
    
    var nextTypeId: number = 0;
    
    /**
     * Creates a type name for use with the TypeDefinition interface
     */
    export function createTypeName(): string {
        ++nextTypeId;
        return nextTypeId.toString();
    }
    
    /**
     * The default behaviour object is used to describe how a new game is initialised
     *
     * When a game is started for the first time, the functions stored in this object are called
     * (in alphabetical order by name) in order to register any behaviour. The core game has
     * almost no behaviour by default.
     *
     * There are a few 'well-known' behaviour names. These all begin with 't' to make room for 
     * user-defined behaviours:
     *
     *      tRenderer:      the renderer behaviour (the part that fills the render queue)
     *      tPhysics:       the physics behaviour
     *      tSpriteRender:  the behaviour that attaches the sprite renderer to any object with a sprite ID
     *
     * This is designed to provide a way for modules to have a way to initialise themselves
     * whenever a new Game is set up, as well as for the engine to supply default behaviours
     * that can be overridden (for example, to provide a choice of physics engines)
     */
    export var defaultBehavior: { [ behaviourName: string ]: (newGame: Game) => void } = {};
}
