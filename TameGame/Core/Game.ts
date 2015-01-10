/// <reference path="Interface.ts"/>
/// <reference path="Watch.ts" />
/// <reference path="Event.ts" />
/// <reference path="PropertyManager.ts" />
/// <reference path="BehaviorManager.ts" />
/// <reference path="../RenderQueue/RenderQueue.ts"/>

module TameGame {
    /**
     * The internal scene interface describes events and properties used
     * to help with dispatching the property changed events
     */
    interface InternalScene extends Scene {
        _watchers: RegisteredWatchers;
        objectInScene(id:number): boolean;
        getChildScenes(): InternalScene[];
        
        _firePassStart:     FireFilteredEvent<UpdatePass, UpdatePass>;
        _firePassFinish:    FireFilteredEvent<UpdatePass, UpdatePass>;
        _fireRender:        Event<RenderQueue>;
    }

    interface OnPassCallback {
        (milliseconds: number, lastMilliseconds: number): void;
    }

    /**
     * The default Game class
     *
     * Note that in general that you should not directly create this object
     * but rather use the launcher to start a new game.
     */
    export class StandardGame implements Game {
        constructor(initialSize: Size, messageDispatcher: WorkerMessageDispatcher) {
            // Variables describing the game state
            var _currentScene: Scene;
            var _nextIdentifier: number;
            var _watchers: RegisteredWatchers;
            var _propertyManager: PropertyManager;
            var _behaviorManager: BehaviorManager;
            var _immediate: { [propertyName: string]: (obj: TameObject) => void };
            var _immediateActions: { [propertyName: string]: { priority: number; callback: (obj: TameObject, value: any) => void }[] };
            
            var _firePassStart:     FireFilteredEvent<UpdatePass, UpdatePass>;
            var _firePassFinish:    FireFilteredEvent<UpdatePass, UpdatePass>;
            var _fireRender:        Event<RenderQueue>;
            var _firePerformRender: Event<RenderQueue>;
            var _fireNewScene:      Event<Scene>;
            var _fireCreateScene:   Event<Scene>;
            
            var _renderQueue:       RenderQueue;
            var _currentTime:       number;
            var _lastTime:          number;

            // Display a warning and use an empty message dispatcher if none is passed in
            if (!messageDispatcher) {
                console.warn('No message dispatcher set');
                messageDispatcher = { onMessage: () => { return { cancel: () => {} } } };
            }

            // Set up the variables
            _nextIdentifier         = 0;
            _watchers               = new RegisteredWatchers();
            _immediate              = {};
            _immediateActions       = {};
            _renderQueue            = new StandardRenderQueue(initialSize);
            _currentTime            = 0;
            _lastTime               = 0;
            _propertyManager        = new PropertyManager(_immediate);
            _behaviorManager        = new BehaviorManager();
            
            // Set up the events
            var passStartEvent      = createFilteredEvent<UpdatePass, UpdatePass>();
            var passFinishEvent     = createFilteredEvent<UpdatePass, UpdatePass>();
            var renderEvent         = createEvent<RenderQueue>();
            var performRenderEvent  = createEvent<RenderQueue>();
            var newSceneEvent       = createEvent<Scene>();
            var createSceneEvent    = createEvent<Scene>();
            var createObjectEvent   = createEvent<TameObject>();
            
            this.events = {
                onPassStart:        passStartEvent.register,
                onPassFinish:       passFinishEvent.register,
                onRender:           renderEvent.register,
                onPerformRender:    performRenderEvent.register,
                onNewScene:         newSceneEvent.register,
                onCreateScene:      createSceneEvent.register,
                onCreateObject:     createObjectEvent.register
            };
            
            _firePassStart     = passStartEvent.fire;
            _firePassFinish    = passFinishEvent.fire;
            _fireRender        = renderEvent.fire;
            _fireNewScene      = newSceneEvent.fire;
            _firePerformRender = performRenderEvent.fire;
            _fireCreateScene   = createSceneEvent.fire;

            /**
             * Creates a new TameObject that will participate in this game
             */
            var createObject = (): TameObject => {
                // An object contains some properties and behaviors, which we declare here
                var properties = {};
                var behaviors = {};
                var obj: TameObject;

                var identifier = _nextIdentifier;
                _nextIdentifier++;

                // Create basic object
                obj = {
                    identifier:     identifier,
                    behavior:       {},
                    scene:          null
                };
                
                // Set up the watchable properties and behaviors
                _behaviorManager.initObject(obj);
                _propertyManager.initObject(obj);

                createObjectEvent.fire(obj, _currentTime, _lastTime);
                return obj;
            }

            /**
             * Creates a new scene
             */
            var createScene = (): Scene => {
                // Variables used in a scene
                var objects: { [id: number]: TameObject } = {};
                var subScenes: { [id: number]: Scene } = {};
                var sceneWatchers = new RegisteredWatchers();
                
                // Create the event handlers for this scene
                var passStartEvent      = createFilteredEvent<UpdatePass, UpdatePass>();
                var passFinishEvent     = createFilteredEvent<UpdatePass, UpdatePass>();
                var renderEvent         = createEvent<RenderQueue>();
                var addObjectEvent      = createEvent<TameObject>();
                var removeObjectEvent   = createEvent<TameObject>();
                var addSubSceneEvent    = createEvent<Scene>();
                var removeSubSceneEvent = createEvent<Scene>();

                // Basic functions
                function addObject(o: TameObject): Scene {
                    if (o.scene) {
                        o.scene.removeObject(o);
                    }
                    
                    objects[o.identifier] = o;
                    addObjectEvent.fire(o, _currentTime, _lastTime);
                    o.scene = this;
                    return this;
                }
                function removeObject(o: TameObject): Scene {
                    if (o.scene !== this) {
                        return;
                    }
                    o.scene = null;
                    
                    delete objects[o.identifier];
                    removeObjectEvent.fire(o, _currentTime, _lastTime);
                    return this;
                }
                function addScene(s: Scene): Scene {
                    subScenes[s.identifier] = s;
                    addSubSceneEvent.fire(s, _currentTime, _lastTime);
                    return this;
                }
                function removeScene(s: Scene): Scene {
                    delete subScenes[s.identifier];
                    removeSubSceneEvent.fire(s, _currentTime, _lastTime);
                    return this;
                }
                function forAllObjects(callback: (obj: TameObject) => void) {
                    Object.keys(objects).forEach((objId) => callback(objects[objId]));
                }
                function forAllSubscenes(callback: (scene: Scene) => void) {
                    Object.keys(subScenes).forEach((subSceneId) => callback(subScenes[subSceneId]));
                }

                // Assign an identifier to this object
                var identifier = _nextIdentifier;
                _nextIdentifier++;

                var result: InternalScene = {
                    _watchers:          sceneWatchers,
                    _firePassStart:     passStartEvent.fire,
                    _firePassFinish:    passFinishEvent.fire,
                    _fireRender:        renderEvent.fire,
                    objectInScene:      (id) => objects[id]?true:false,
                    getChildScenes:     () => Object.keys(subScenes).map((key) => <InternalScene> subScenes[key]),
                    
                    identifier:         identifier,
                    addObject:          addObject,
                    removeObject:       removeObject,
                    addScene:           addScene,
                    removeScene:        removeScene,
                    forAllObjects:      forAllObjects,
                    forAllSubscenes:    forAllSubscenes,
                    
                    watch:              (definition, pass, callback)    => sceneWatchers.watch(definition, pass, callback),
                    onPass:             (pass, callback)                => sceneWatchers.onPass(pass, callback),
                    everyPass:          (pass, callback)                => sceneWatchers.everyPass(pass, callback),
                
                    events: {
                        onPassStart:        passStartEvent.register,
                        onPassFinish:       passFinishEvent.register,
                        onRender:           renderEvent.register,
                        onAddObject:        addObjectEvent.register,
                        onRemoveObject:     removeObjectEvent.register,
                        onAddSubScene:      addSubSceneEvent.register,
                        onRemoveSubScene:   removeSubSceneEvent.register
                    }
                };
                
                _fireCreateScene(result, _currentTime, _lastTime);
                return result;
            }

            /**
             * Starts running the specified scene
             */
            var startScene = (scene: Scene) => {
                // Update the current scene
                _currentScene = scene;
                
                // Fire an event to indicate that the scene has changed
                _fireNewScene(scene, _currentTime, _lastTime);
            }
            
            /**
             * Retrieves the list of currently active scenes
             */
            var getActiveScenes = (): InternalScene[] => {
                // There are no active scenes if the current scene is not set
                if (!_currentScene) {
                    return [];
                }
                
                // Get the active scenes recursively
                var scenes: InternalScene[] = [];
                var stack: InternalScene[] = [];
                
                stack.push(<InternalScene> _currentScene);
                
                while (stack.length > 0) {
                    var nextScene = stack.pop();
                    scenes.push(nextScene);
                    
                    scenes.push.apply(scenes, nextScene.getChildScenes());
                }
                
                // Return the results
                return scenes;
            }

            var onNextPass: { [pass: number]: OnPassCallback[] } = {};

            /**
             * Performs the actions associated with a pass
             */
            var runPass = (pass: UpdatePass, milliseconds: number, lastMilliseconds: number, sceneChanges: { scene: InternalScene; watchers: RegisteredWatchers; changes: Watcher }[] , callback?: () => void) => {
                // Fire the pass start event
                _firePassStart(pass, pass, milliseconds, lastMilliseconds);

                // Fire the on-shot events for this pass
                var oneShot = onNextPass[pass];
                if (oneShot) {
                    oneShot.forEach(fn => fn(milliseconds, lastMilliseconds));
                    onNextPass[pass] = null;
                }

                // Fire the scene pass start events and any on/every pass handlers
                sceneChanges.forEach((change) => {
                    change.scene._firePassStart(pass, pass, milliseconds, lastMilliseconds)
                    change.scene._watchers.performPassEvents(pass, milliseconds, lastMilliseconds);
                });

                // Dispatch the changes for this pass to the watchers - both global and for each scene in turn
                var recentChanges = _propertyManager.getRecentChanges();
                recentChanges.dispatchChanges(pass, _watchers, milliseconds, lastMilliseconds);

                sceneChanges.forEach((change) => {
                    change.changes.dispatchChanges(pass, change.watchers, milliseconds, lastMilliseconds);
                });
                
                if (callback) {
                    callback();
                }

                sceneChanges.forEach((change) => change.scene._firePassFinish(pass, pass, milliseconds, lastMilliseconds));
                _firePassFinish(pass, pass, milliseconds, lastMilliseconds);
            }
            
            /**
             * Executes a callback for the running scene and any subscenes it may have
             */
            var forAllActiveScenes = (callback: (scene: Scene) => void) => {
                getActiveScenes().forEach(callback);
            }
            
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
            var tick = (milliseconds: number, withRender: boolean) => {
                // Update the current time
                _lastTime       = _currentTime;
                _currentTime    = milliseconds;
                
                // Retrieve the list of active scenes
                var activeScenes = getActiveScenes();
                
                // Get the watchers and filter the change list for each of the scenes
                var recentChanges = _propertyManager.getRecentChanges();
                var sceneChanges = activeScenes.map((scene) => { 
                    return { scene: scene, watchers: scene._watchers, changes: recentChanges.filter(scene.objectInScene) }
                });
                
                // Run the pre-render passes
                preRenderPasses.forEach((pass) => runPass(pass, milliseconds, _lastTime, sceneChanges));
                
                // Run the render pass
                var queue = _renderQueue;
                queue.clearQueue();
                
                if (withRender) {
                    runPass(UpdatePass.Render, milliseconds, _lastTime, sceneChanges, () => {
                        // Send the render event
                        _fireRender(queue, milliseconds, _lastTime);
                        activeScenes.forEach((scene) => scene._fireRender(queue, milliseconds, _lastTime));
                        
                        // Actually perform the render
                        _firePerformRender(queue, milliseconds, _lastTime);
                    });
                }
                
                // Run the post-render passes
                postRenderPasses.forEach((pass) => runPass(pass, milliseconds, _lastTime, sceneChanges));

                // Clear out any property changes: they are now all handled
                recentChanges.clearChanges();
            }

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
            function watch<TPropertyType>(definition: TypeDefinition<TPropertyType>, updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>, priority?: number): Cancellable {
                if (updatePass === UpdatePass.Immediate) {
                    if (typeof priority === 'undefined' || priority === null) {
                        priority = 0;
                    }
                    
                    // Get the immediate actions for this property
                    var actions = _immediateActions[definition.name];

                    if (!actions) {
                        var readFrom = definition.readFrom;

                        // Register new actions
                        _immediateActions[definition.name] = actions = [];

                        // When the action occurs, call each item in the actions array
                        _immediate[definition.name] = (obj) => {
                            var x: number;
                            var length: number = actions.length;
                            var val = readFrom(obj);

                            for (x=0; x<length; ++x) {
                                actions[x].callback(obj, val);
                            }
                        };
                    }

                    // Append the action
                    actions.push({ 
                        priority: priority,
                        callback: callback
                    });
                    
                    actions.sort((a, b) => {
                        if (a.priority > b.priority) {
                            return 1;
                        } else if (a.priority < b.priority) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });

                    // TODO: cancelling
                    return { cancel: () => {} };
                } else {
                    // Use the standard watcher
                    return _watchers.watch(definition, updatePass, callback);
                }
            }

            var onPass = (updatePass: UpdatePass, callback: (milliseconds: number, lastMilliseconds: number) => void) => {
                var eventsForPass = onNextPass[updatePass];
                if (!eventsForPass) {
                    onNextPass[updatePass] = eventsForPass = [];
                }

                eventsForPass.push(callback);
            }
            var everyPass = (updatePass: UpdatePass, callback: (milliseconds: number, lastMilliseconds: number) => void): Cancellable => {
                return passStartEvent.register(updatePass, (updatePass, milliseconds, lastMilliseconds) => callback(milliseconds, lastMilliseconds));
            }

            // Store the functions to create the final object
            this.createObject       = createObject;
            this.createScene        = createScene;
            this.startScene         = startScene;
            this.forAllActiveScenes = forAllActiveScenes;
            this.tick               = tick;
            this.watch              = watch;
            this.onPass             = onPass;
            this.everyPass          = everyPass;

            // == Game is ready for use ==
            
            // Initialise the default behaviours
            var initializedBehavior: { [name: string]: boolean } = {};
            var initBehavior = (name: string) => {
                if (initializedBehavior[name]) {
                    return;
                }
                
                // Mark this behavior as initialised (prevent initialisation loops)
                initializedBehavior[name] = true;
                
                // Initialise its dependenceis
                var dependencies = behaviorDependencies[name];
                if (dependencies) {
                    dependencies.forEach((dependentName) => initBehavior(dependentName));
                }
                
                // Initialise this behavior
                defaultBehavior[name](this, messageDispatcher);
            }
            
            Object.keys(defaultBehavior).sort().forEach((behaviorName) => initBehavior(behaviorName));
        }

        /**
         * Creates a new TameObject that will participate in this game
         */
        createObject: () => TameObject;

        /**
         * Creates a new scene
         */
        createScene: () => Scene;

        /**
         * Starts running the specified scene
         */
        startScene: (scene: Scene) => void;
        
        /**
         * Executes a callback for the running scene and any subscenes it may have
         */
        forAllActiveScenes: (callback: (scene: Scene) => void) => void;

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
        tick: (milliseconds: number, withRender: boolean) => void;

        /**
         * The events for this object
         */
        events: GameEvents;

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
        watch: (definition: any, updatePass: UpdatePass, callback: any, priority?: number) => Cancellable;              // Prototype is not correct, but TypeScript doesn't seem to allow the generic syntax to be used in lambda definitions

        /**
         * When this object is part of the active scene and the game hits
         * the specified pass as part of processing a tick, the callback
         * is called, once only.
         */
        onPass: (updatePass: UpdatePass, callback: (milliseconds: number) => void) => void;

        /**
         * As for onPass, but the call is made every time this object is part
         * of the active scene and the game hits the specified pass.
         */
        everyPass: (updatePass: UpdatePass, callback: (milliseconds: number) => void) => Cancellable;
    }
}
