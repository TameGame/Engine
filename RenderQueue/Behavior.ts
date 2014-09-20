/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />

module TameGame {
    /**
     * Behavior that can be implemented by objects that know how to render themselves
     *
     * Implement this interface and call TameObject.attachBehavior() in order to cause an object
     * to render in a custom manner.
     */
    export interface IRenderBehavior {
        /**
         * Adds rendering actions to the supplied render queue
         */
        render(obj: TameObject, queue: RenderQueue): void;
    }
    
    /**
     * Type definition for object render behaviour
     */
    export var RenderBehavior: TypeDefinition<IRenderBehavior> = {
        name: createTypeName(),
        createDefault() {
            return { render: () => {} };
        },
        readFrom: (obj: TameObject) => obj.getBehavior(RenderBehavior)
    };
}
