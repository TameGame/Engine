/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />
/// <reference path="../Physics/Space.ts" />

module TameGame {
    "use strict";

    /**
     * Behavior that can be implemented by objects that know how to render themselves
     */
    export interface IRenderBehavior {
        /**
         * Renders the current object
         */
        (obj: SpaceRef<TameObject>, queue: RenderQueue): void;
    }

    /**
     * Behavior that can be implemented by scenes that know how to render themselves
     */
    export interface ISceneRenderBehavior {
        /**
         * Renders the current scene
         */
        (obj: Scene, queue: RenderQueue): void;
    }
    
    export interface Behavior {
        render?: IRenderBehavior;
        renderScene?: ISceneRenderBehavior;
    }
    
    /**
     * Type definition for object render behaviour
     */
    export var RenderBehavior = declareBehavior<IRenderBehavior>('render', () => {
            return () => {};
    });

    /**
     * Type definition for scene render behaviour
     */
    export var SceneRenderBehavior = declareBehavior<IRenderBehavior>('renderScene', () => {
            return () => {};
    });
}
