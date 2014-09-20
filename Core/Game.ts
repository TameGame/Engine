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

    /**
     * The default Game class
     *
     * Note that in general that you should not directly create this object
     * but rather use the launcher to start a new game.
     */
    export class StandardGame implements Game {
        private _currentScene: Scene;
        private _nextIdentifier: number;
        private _watchers: RegisteredWatchers;
        private _propertyManager: PropertyManager;
        private _behaviorManager: BehaviorManager;
        private _immediate: { [propertyName: string]: (obj: TameObject) => void };
        private _immediateActions: { [propertyName: string]: { priority: number; callback: (obj: TameObject) => void }[] };
        
        private _firePassStart:     FireFilteredEvent<UpdatePass, UpdatePass>;
        private _firePassFinish:    FireFilteredEvent<UpdatePass, UpdatePass>;
        private _fireRender:        Event<RenderQueue>;
        private _firePerformRender: Event<RenderQueue>;
        private _fireNewScene:      Event<Scene>;
        private _fireCreateScene:   Event<Scene>;
        
        private _renderQueue:       RenderQueue;
        private _currentTime:       number;

        constructor(initialSize: Size) {
            // Set up the variables
            this._nextIdentifier    = 0;
            this._watchers          = new RegisteredWatchers();
            this._immediate         = {};
            this._immediateActions  = {};
            this._renderQueue       = new StandardRenderQueue(initialSize);
            this._currentTime       = 0;
            this._propertyManager   = new PropertyManager(this._immediate);
            this._behaviorManager   = new BehaviorManager();
            
            // Set up the events
            var passStartEvent      = createFilteredEvent<UpdatePass, UpdatePass>();
            var passFinishEvent     = createFilteredEvent<UpdatePass, UpdatePass>();
            var renderEvent         = createEvent<RenderQueue>();
            var performRenderEvent  = createEvent<RenderQueue>();
            var newSceneEvent       = createEvent<Scene>();
            var createSceneEvent    = createEvent<Scene>();
            
            this.events = {
                onPassStart:        passStartEvent.register,
                onPassFinish:       passFinishEvent.register,
                onRender:           renderEvent.register,
                onPerformRender:    performRenderEvent.register,
                onNewScene:         newSceneEvent.register,
                onCreateScene:      createSceneEvent.register
            };
            
            this._firePassStart     = passStartEvent.fire;
            this._firePassFinish    = passFinishEvent.fire;
            this._fireRender        = renderEvent.fire;
            this._fireNewScene      = newSceneEvent.fire;
            this._firePerformRender = performRenderEvent.fire;
            this._fireCreateScene   = createSceneEvent.fire;
            
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
                defaultBehavior[name](this);
            }
            
            Object.keys(defaultBehavior).sort().forEach((behaviorName) => initBehavior(behaviorName));
        }

        /**
         * Creates a new TameObject that will participate in this game
         */
        createObject(): TameObject {
            // An object contains some properties and behaviors, which we declare here
            var properties = {};
            var behaviors = {};
            var obj: TameObject;

            var identifier = this._nextIdentifier;
            this._nextIdentifier++;

            // Create basic object
            obj = {
                identifier:     identifier,
                behavior:       {},
                scene:          null
            };
            
            // Set up the watchable properties and behaviors
            this._behaviorManager.initObject(obj);
            this._propertyManager.initObject(obj);
            return obj;
        }

        /**
         * Creates a new scene
         */
        createScene(): Scene {
            var game = this;
            
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
                addObjectEvent.fire(o, game._currentTime);
                o.scene = this;
                return this;
            }
            function removeObject(o: TameObject): Scene {
                if (o.scene !== this) {
                    return;
                }
                o.scene = null;
                
                delete objects[o.identifier];
                removeObjectEvent.fire(o, game._currentTime);
                return this;
            }
            function addScene(s: Scene): Scene {
                subScenes[s.identifier] = s;
                addSubSceneEvent.fire(s, game._currentTime);
                return this;
            }
            function removeScene(s: Scene): Scene {
                delete subScenes[s.identifier];
                removeSubSceneEvent.fire(s, game._currentTime);
                return this;
            }
            function forAllObjects(callback: (obj: TameObject) => void) {
                Object.keys(objects).forEach((objId) => callback(objects[objId]));
            }
            function forAllSubscenes(callback: (scene: Scene) => void) {
                Object.keys(subScenes).forEach((subSceneId) => callback(subScenes[subSceneId]));
            }

            // Assign an identifier to this object
            var identifier = this._nextIdentifier;
            this._nextIdentifier++;

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
            
            this._fireCreateScene(result, this._currentTime);
            return result;
        }

        /**
         * Starts running the specified scene
         */
        startScene(scene: Scene): void {
            // Update the current scene
            this._currentScene = scene;
            
            // Fire an event to indicate that the scene has changed
            this._fireNewScene(scene, this._currentTime);
        }
        
        /**
         * Retrieves the list of currently active scenes
         */
        private getActiveScenes(): InternalScene[] {
            // There are no active scenes if the current scene is not set
            if (!this._currentScene) {
                return [];
            }
            
            // Get the active scenes recursively
            var scenes: InternalScene[] = [];
            var stack: InternalScene[] = [];
            
            stack.push(<InternalScene> this._currentScene);
            
            while (stack.length > 0) {
                var nextScene = stack.pop();
                scenes.push(nextScene);
                
                scenes.push.apply(scenes, nextScene.getChildScenes());
            }
            
            // Return the results
            return scenes;
        }

        /**
         * Performs the actions associated with a pass
         */
        private runPass(pass: UpdatePass, milliseconds: number, sceneChanges: { scene: InternalScene; watchers: RegisteredWatchers; changes: Watcher }[] , callback?: () => void) {
            this._firePassStart(pass, pass, milliseconds);
            sceneChanges.forEach((change) => change.scene._firePassStart(pass, pass, milliseconds));

            // Dispatch the changes for this pass to the watchers - both global and for each scene in turn
            var recentChanges = this._propertyManager.getRecentChanges();
            recentChanges.dispatchChanges(pass, this._watchers);

            sceneChanges.forEach((change) => {
                change.changes.dispatchChanges(pass, change.watchers);
            });
            
            if (callback) {
                callback();
            }

            sceneChanges.forEach((change) => change.scene._firePassFinish(pass, pass, milliseconds));
            this._firePassFinish(pass, pass, milliseconds);
        }
        
        /**
         * Executes a callback for the running scene and any subscenes it may have
         */
        forAllActiveScenes(callback: (scene: Scene) => void): void {
            this.getActiveScenes().forEach(callback);
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
        tick(milliseconds: number): void {
            // Update the current time
            this._currentTime = milliseconds;
            
            // Retrieve the list of active scenes
            var activeScenes = this.getActiveScenes();
            
            // Get the watchers and filter the change list for each of the scenes
            var recentChanges = this._propertyManager.getRecentChanges();
            var sceneChanges = activeScenes.map((scene) => { 
                return { scene: scene, watchers: scene._watchers, changes: recentChanges.filter(scene.objectInScene) }
            });
            
            // Run the pre-render passes
            preRenderPasses.forEach((pass) => this.runPass(pass, milliseconds, sceneChanges));
            
            // Run the render pass
            var queue = this._renderQueue;
            queue.clearQueue();
            
            this.runPass(UpdatePass.Render, milliseconds, sceneChanges, () => {
                // Send the render event
                this._fireRender(queue, milliseconds);
                activeScenes.forEach((scene) => scene._fireRender(queue, milliseconds));
                
                // Actually perform the render
                this._firePerformRender(queue, milliseconds);
            });
            
            // Run the post-render passes
            postRenderPasses.forEach((pass) => this.runPass(pass, milliseconds, sceneChanges));

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
        watch<TPropertyType>(definition: TypeDefinition<TPropertyType>, updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>, priority?: number): Cancellable {
            if (updatePass === UpdatePass.Immediate) {
                if (typeof priority === 'undefined' || priority === null) {
                    priority = 0;
                }
                
                // Get the immediate actions for this property
                var actions = this._immediateActions[definition.name];

                if (!actions) {
                    // Register new actions
                    this._immediateActions[definition.name] = actions = [];

                    // When the action occurs, call each item in the actions array
                    this._immediate[definition.name] = (obj) => {
                        actions.forEach((action) => {
                            action.callback(obj);
                        });
                    };
                }

                // Append the action
                actions.push({ 
                    priority: priority,
                    callback: (obj: TameObject) => {
                        callback(obj, definition.readFrom(obj));
                    } 
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
                return this._watchers.watch(definition, updatePass, callback);
            }
        }

        /**
         * When this object is part of the active scene and the game hits
         * the specified pass as part of processing a tick, the callback
         * is called, once only.
         */
        onPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) {
        }

        /**
         * As for onPass, but the call is made every time this object is part
         * of the active scene and the game hits the specified pass.
         */
        everyPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) : Cancellable {
            return null;
        }

        /**
         * The events for this object
         */
        events: GameEvents;
    }
}
