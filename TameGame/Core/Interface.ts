/// <reference path="../RenderQueue/Interface.ts"/>

module TameGame {
    "use strict";

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
     *
     * Milliseconds is the time of the current tick.
     * lastMilliseconds is the time of the previous tick
     */
    export interface Event<TParameterType> {
        (param: TParameterType, milliseconds: number, lastMilliseconds: number): void;
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
        (filterVal: TFilterType, param: TParameterType, millseconds: number, lastMilliseconds: number): void;
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
        
        /** The preparation pass, where values can be set up for the future passes */
        Preparation,
        
        /** Pass where changes caused by player input are handled */
        PlayerInput,

        /** The animation pass, when animated properties are updated */
        Animations,

        /** The mechanics pass, when the effects of game mechanics on properties are processed */
        Mechanics,

        /** Physics pass where objects are moved */
        PhysicsMotion,
        
        /** Physics pass where collisions are handled */
        PhysicsCollision,

        // The pre-render update pass
        PreRender,

        /** The render pass, when the render queue for the current tick is generated */
        Render,

        /** The post-render pass, after the render queue has been passed off */
        PostRender
    }
    
    /**
     * The update passes that occur prior to rendering
     */
    export var preRenderPasses  = [ UpdatePass.Preparation, UpdatePass.PlayerInput, UpdatePass.Animations, UpdatePass.Mechanics, UpdatePass.PhysicsMotion, UpdatePass.PhysicsCollision, UpdatePass.PreRender ];
    
    /**
     * The update passes that occur after rendering
     */
    export var postRenderPasses = [ UpdatePass.PostRender ];
    
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
        // A unique name for this type (different from any other type definition)
        uniqueName: string;

        // Creates a new default value for this property
        createDefault(): TType;
        
        // Reads the value of a property of this type from a particular object
        readFrom: (obj: any) => TType;
    }

    /**
     * A property definition defines a watchable property
     */
    export interface PropertyDefinition<TType> extends TypeDefinition<TType> {
        // The given name for this property ()
        givenName: string;
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
         *
         * The priority value indicates the order in which the watch callbacks
         * are made. Lower values are called earlier. Some well-known priorities
         * are found in the Priority object. A priority of 0 is used if this
         * parameter is not specified.
         */
        watch<TPropertyType>(definition: PropertyDefinition<TPropertyType>, updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>, priority?: number): Cancellable;

        /**
         * When this object is part of the active scene and the game hits
         * the specified pass as part of processing a tick, the callback
         * is called, once only.
         */
        onPass(updatePass: UpdatePass, callback: (milliseconds: number, lastMilliseconds: number) => void);

        /**
         * As for onPass, but the call is made every time this object is part
         * of the active scene and the game hits the specified pass.
         */
        everyPass(updatePass: UpdatePass, callback: (milliseconds: number, lastMilliseconds: number) => void) : Cancellable;
    }
    
    /**
     * Well known action priorities
     */
    export var Priority = {
        /**
         * High-priority task that fills in values that are directly derived from the
         * properties being set.
         */
        FillDerivedValues: -1.0,
    
        /**
         * Medium-priority a task that fills in values that depend derived values from
         * other tasks as well as the properties being set
         */
        UseDerivedValues: -0.5
    };
    
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

        /** A new object has been created */
        onCreateObject: EventRegistration<TameObject>;
        
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
     * The behavior interface defines the possible behaviours of an object
     */
    export interface Behavior {
        /** Adds a class to this object */
        addClass?: (newClass: string) => void;

        /** Removes a class from this object */
        removeClass?: (oldClass: string) => void;

        /** Retrieves the classes for this object */
        getClasses?: () => string[];

        /** Sets/gets the behavior state of this object */
        state?: string;
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
         * The behaviors of this object
         */
        behavior: Behavior;
        
        /**
         * Every object can belong to at most once scene
         */
        scene: Scene;
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

        /**
         * Behaviors attached to this scene
         */
        behavior: Behavior;
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
         * Executes a callback for the running scene and any subscenes it may have
         */
        forAllActiveScenes(callback: (scene: Scene) => void): void;

        /**
         * Runs a game tick. Time is a time in milliseconds from an arbitrary
         * fixed point (it should always increase)
         *
         * Normally you don't need to call this manually, the game launcher
         * will set things up so that it's called automatically.
         *
         * It's a good idea to choose a fixed point that's reasonably recent
         * so that time can be measured to a high degree of accuracy.
         *
         * If withRender is set to false, then the rendering pass won't be executed
         * (this can occur when catching up with missed frames)
         */
        tick(milliseconds: number, withRender: boolean): void;
        
        /**
         * The events for this object
         */
        events: GameEvents;

        /**
         * Behaviors attached to this game
         */
        behavior: Behavior;

        /**
         * The prototype used for creating new objects with createObject()
         */
        objectPrototype: TameObject;

        /**
         * The prototype used for creating new scenes with createScene()
         */
        scenePrototype: Scene;
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
     *      tLiveObjects:   behavior that controls how objects become 'alive' and are processed per tick
     *
     * This is designed to provide a way for modules to have a way to initialise themselves
     * whenever a new Game is set up, as well as for the engine to supply default behaviours
     * that can be overridden (for example, to provide a choice of physics engines)
     */
    export var defaultBehavior: { [ behaviorName: string ]: (newGame: Game, messageDispatcher: WorkerMessageDispatcher) => void } = {};
    
    /**
     * Specifies which behaviors must be initialised before a particular behavior
     *
     * Behaviors can optionally specify some dependencies: these specify the names of the other
     * behaviors within the defaultBehavior object that should be initialised before they can
     * work. For instance, many kinds of behavior require the live objects behavior to be
     * registered first.
     */
    export var behaviorDependencies: { [behaviorName: string]: string[] } = {};

    /**
     * Form of a message passed in to or from a TameGame web worker
     */
    export interface WorkerMessage {
        /** The action to take */
        action: string;
        
        /** The data for this message */
        data?: any;
    }

    /**
     * Interface implmented by objects that can dispatch messages sent to a web worker
     */
    export interface WorkerMessageDispatcher {
        /** Registers a handler to be fired when a particular message is received */
        onMessage: FilteredEventRegistration<string, WorkerMessage>;
    }
}
